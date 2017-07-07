var fixed_chart = echarts.init(document.getElementById('fixed'));
var properties_map = new Map();
vm = new Vue({
    el:"#GraphVue",
    data:{
        conditions: [ ],
        targets: [ ],
        table_data: [ ],
        label: "",
        all_properties: []
    },
    mounted: function(){
        this.DrawFixedGraph();
    },
    methods:{
        //Draw knowledge graph
        DrawFixedGraph: function(){
            //console.log(form_vue.$data.source_content);
            this.$http({
                method:"POST",
                url: "http://localhost:7474/db/data/transaction/commit",
                body: {
                        "statements" : [ {
                            "statement" : "match (a)-[r]->(b) return distinct labels(a),labels(b), type(r)"
                        } ]
                      },
                headers:{"Content-Type":"application/json","Authorization":"Basic bmVvNGo6cm9vdA=="},
            }).then(res=>{
                fixed_chart.showLoading();
                _fixed_chart = fixed_chart;
                processed_json = FixedDataProcessor(res.body);
                GenerateFixedGraph(processed_json,_fixed_chart);
                this.GetProperties(processed_json.nodes);
                //globle_adjTable = GenerateAdjTable(FixedDataProcessor(res.body));
                //console.log(BuildCypher([{'type':'Brand','content':'condi'},{'type':'Model', 'content':' '},{'type':'Masterbrand', 'content':'condi'}],[{'type':'Dealer', 'content':' '}]));
            });
        },

        GetProperties: function(nodes){
            let statements = [];
            for (let node of nodes){
                tmp_statement = {"statement" : "match (%s:%s) return keys(%s) limit 1".replace(/%s/g, node.name)};
                statements.push(tmp_statement);
            }
            properties_map.clear();
            this.$http({
                method:"POST",
                url: "http://localhost:7474/db/data/transaction/commit",
                body: {
                    "statements" : statements
                },
                headers:{"Content-Type":"application/json","Authorization":"Basic bmVvNGo6cm9vdA=="}
            }).then(res=>{
                for (let result of res.body.results){
                    let tmp_data = [];
                    let key = result.columns[0].substring(5, result.columns[0].length-1);
                    for (let property of result.data[0].row[0]){
                        tmp_data.push({"property":property});
                        this.all_properties.push({"property":property,"type":key});
                    }
                    
                    properties_map.set(key, tmp_data);
                }
            });
            
        },

        GenerateTemplate: function(){
            let tmp_str = new String();
            let json_template = {};
            json_template['conditions'] = [];
            json_template['targets'] = [];
            for(let condition of this.conditions){
                console.log(condition);
                let tmp_con = {};
                tmp_con[condition] = {};
                json_template['conditions'].push(tmp_con);
            }
            for(let target of this.targets){
                let tmp_con = {};
                tmp_con[target] = {};
                json_template['targets'].push(tmp_con);
            }
            json_template['enable_graph'] = false;
            json_template['enable_like'] = false;
            console.log(json_template);
            editor.setValue(JSON.stringify(json_template, null, '\t'));
        },

        RemoveCondition: function(en){
            // this.conditions.forEach(function(item,index){
            //     if(item.type == en.target.parentElement.children[0].innerText){
            //         tmp_idx = index;
            //     }
            // });
            let index = this.conditions.indexOf(en.target.parentElement.children[0].innerText);
            this.conditions.splice(index, 1);
        },
        RemoveTarget: function(en){
            // let tmp_idx = -1;
            // this.targets.forEach(function(item, index){
            //     if(item.type == en.target.parentElement.children[0].innerText){
            //         tmp_idx = index;
            //     }
            // });
            let index = this.targets.indexOf(en.target.parentElement.children[0].innerText);
            this.targets.splice(index, 1);
        }        
    }
});

function FixedDataProcessor(rawjson){
    let edges = new Array();
    let nodes = new Array();
    let node_set = new Set();
    rawjson.results["0"].data.forEach(function(relationship){
        //console.log(relationship.row[2]);
        new_edge = {
            "source":relationship.row[0][0],
            "target":relationship.row[1][0],
            "value":relationship.row[2]
        };
        node_set.add(relationship.row[0][0]);
        node_set.add(relationship.row[1][0]);
        edges.push(new_edge);
    });
    node_set.forEach(function(node){
        nodes.push({"name":node});
    });
    return {"nodes":nodes, "links":edges};
}


function GenerateFixedGraph(knowledge,_fixed_chart){
    _fixed_chart.hideLoading();
    option = {
        title:{
            text: "Auto Knowledge Graph Query System"
        },
        //controll panel for choosing condition or target
        graphic:[
        {
            type: 'group',
            bounding: 'all',
            right: 50+70,
            top: 50,
            //invisible: true,
            children: [
                {
                    type: 'circle',
                    id: 'circle',
                    left: 'center',
                    top: 'center',
                    silent: true,
                    invisible: true,
                    shape: {
                        r: 50
                    },
                    style: {
                        fill: 'rgba(0,0,0,0.3)'
                    }
                },
                {
                    type: 'text',
                    id: 'text',
                    right: 'center',
                    top: 'center',
                    silent: true,
                    invisible: true,
                    style: {
                        fill: '#fff',
                        text: 'test',
                        textAlign: 'middle',
                        font: '13px Microsoft YaHei'
                    }
                },
                {
                    type:'sector',
                    id:'right_ring',
                    invisible: true,
                    shape:{
                        r: 70,
                        r0: 50,
                        startAngle:-Math.PI/2,
                        endAngle:Math.PI/2
                    },
                    left: '100%',
                    top: 'center',
                    style: {
                        fill:'#F0F8FF'
                    },
                    onmouseover: function(){
                        _fixed_chart.setOption({
                            graphic:{
                                id: 'right_ring',
                                style: {
                                    fill: '#76eec6'
                                }
                            }
                        });
                    },
                    onmouseout: function(){
                        _fixed_chart.setOption({
                            graphic:{
                                id:'right_ring',
                                style: {
                                    fill: '#F0F8FF'
                                }
                            }
                        });
                    },
                    onclick: function(){
                        // vm.$data.target_type = tmp_name;
                        vm.$data.targets.push(tmp_name);
                        _fixed_chart.setOption({
                            graphic: [
                                {
                                    id: 'left_ring',
                                    invisible: true,
                                },
                                {
                                    id: 'right_ring',
                                    invisible: true,
                                },
                                {
                                    id: 'text',
                                    invisible: true,
                                },
                                {
                                    id: 'circle',
                                    invisible: true
                                }
                            ]
                        });
                    }
            
                },
                {
                    type:'sector',
                    id:'left_ring',
                    invisible: true,
                    shape:{
                        r: 70,
                        r0: 50,
                        startAngle:Math.PI/2,
                        endAngle:Math.PI * 1.5
                    },
                    right: '50%',
                    top: 'center',
                    style: {
                        fill:'#F0F8FF'
                    },
                    onmouseover: function(){
                        _fixed_chart.setOption({
                            graphic:{
                                id: 'left_ring',
                                style: {
                                    fill: '#76eec6'
                                }
                            }
                        });
                    },
                    onmouseout: function(){
                        _fixed_chart.setOption({
                            graphic:{
                                id:'left_ring',
                                style: {
                                    fill: '#F0F8FF'
                                }
                            }
                        });
                    },
                    onclick: function(){
                        //vm.$data.source_type = tmp_name;
                        vm.$data.conditions.push(tmp_name);
                        _fixed_chart.setOption({
                            graphic: [
                                {
                                    id: 'left_ring',
                                    invisible: true,
                                },
                                {
                                    id: 'right_ring',
                                    invisible: true,
                                },
                                {
                                    id: 'text',
                                    invisible: true,
                                },
                                {
                                    id: 'circle',
                                    invisible: true
                                }
                            ]
                        });
                    }
                }]
            }],
            //Config for force graph
            series: [{
                type: 'graph',
                layout: 'force',
                symbolSize: 30,
                animation: true,
                label:{
                    normal: {
                        position: 'right',
                        formatter: '{b}',
                        show: true
                    }
                },
                edgeLabel: {
                normal: {
                    show: true,
                    textStyle: {
                        fontSize: 10
                    },
                    formatter: "{c}"
                    }
                },
                edgeSymbol: [null,'arrow'],
                draggable: true,
                data: knowledge.nodes,
                links: knowledge.links,
                force: {
                    edgeLength: 100,
                    repulsion: 400,
                    gravity: 0.01
                }
            }]
    };
    _fixed_chart.setOption(option);
    _fixed_chart.on('click', function(params){
        vm.$data.table_data = properties_map.get(params.data.name);
        vm.$data.label = params.data.name;
        //console.log(vm.$data.table_data);
    });
    _fixed_chart.on('dblclick', function (params) {
        tmp_name = params.data.name;
        _fixed_chart.setOption({
            graphic: [
                {
                    id: 'left_ring',
                    invisible: false,
                },
                {
                    id: 'right_ring',
                    invisible: false,
                },
                {
                    id: 'text',
                    invisible: false,
                    style: {
                        text: params.data.name
                    }
                },
                {
                    id: 'circle',
                    invisible: false
                }
            ]
        });
    });
}