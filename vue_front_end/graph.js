// var myChart = echarts.init(document.getElementById('main'));
var fixed_chart = echarts.init(document.getElementById('fixed'));
var globle_adjTable;
var tmp_name;

//Vue instance
vm = new Vue({
    el:"#myVue",
    data:{
        conditions: [ ],
        targets: [ ]
    },
    mounted: function(){
        this.DrawFixedGraph();
    },
    methods:{
        
        //Draw query result
        DrawGraph: function(){
            //console.log(BuildCypher(conditions));
            let statement = BuildCypher(this.conditions,this.targets);
            console.log(statement);
            this.$http({
                method:"POST",
                url: "http://localhost:7474/db/data/transaction/commit",
                body: {
                        "statements" : [ {
                            "statement" : statement, //"Match p = (b:Brand)-[:BELONGS_TO]->()-[:SOLD_BY]->(d:Dealer{siteid:'1'}) return p limit 5",
                            "resultDataContents":["graph"]
                        } ]
                      },
                headers:{"Content-Type":"application/json","Authorization":"Basic bmVvNGo6cm9vdA=="},
                //emulateJSON: false
            }).then(res=>{
                //console.log(res.body);
                GenerateGraph(RawjsonProcessor(res.body));
                //resultVue.$data.loading = false;
            });  
        },
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
                GenerateFixedGraph(FixedDataProcessor(res.body),_fixed_chart);
                globle_adjTable = GenerateAdjTable(FixedDataProcessor(res.body));
                //console.log(BuildCypher([{'type':'Brand','content':'condi'},{'type':'Model', 'content':' '},{'type':'Masterbrand', 'content':'condi'}],[{'type':'Dealer', 'content':' '}]));
            });
        },

        RemoveCondition: function(en){
            let tmp_idx = -1;
            //console.log(en.target.parentElement.children[0].innerText);
            this.conditions.forEach(function(item,index){
                if(item.type == en.target.parentElement.children[0].innerText){
                    tmp_idx = index;
                }
            });
            this.conditions.splice(tmp_idx, 1);
        },
        RemoveTarget: function(en){
            let tmp_idx = -1;
            // this.targets.forEach(function(item, index){
            //     if(item.type == en.target.parentElement.children[0].innerText){
            //         tmp_idx = index;
            //     }
            // });
            tmp_idx = this.targets.indexOf(en.target.parentElement.children[0].innerText);
            this.targets.splice(tmp_idx, 1);
        }        
    }
});

resultVue = new Vue({
    el:"#resultVue",
    data: {
        table_data: []
        //loading: true
    }
    

});


//Formating responsed data from Neo4j server for queried data
function RawjsonProcessor(rawjson){
    let id_set = new Set();
    let edge_set = new Set();
    let nodes = new Array();
    let edges = new Array();
    resultVue.$data.table_data = [];
    
    rawjson.results["0"].data.forEach(function(raw_graph){
        raw_graph.graph.nodes.forEach(function(raw_node){
            raw_node.id = parseInt(raw_node.id);
            if(!id_set.has(raw_node.id)){
                id_set.add(raw_node.id);
                nodes.push(raw_node);
                resultVue.$data.table_data.push({'type':raw_node.labels[0], 'properties':JSON.stringify(raw_node.properties)})
                console.log(raw_node);
            }
        });
        raw_graph.graph.relationships.forEach(function(raw_edge){
            raw_edge.id = parseInt(raw_edge.id);
            if(!edge_set.has(raw_edge.id)){
                edge_set.add(raw_edge.id);
                new_edge = {"value":raw_edge.type,"source":raw_edge.startNode,"target":raw_edge.endNode};
                edges.push(new_edge);
            }
        })
    });
    return {"nodes":nodes,"links":edges};
}

//Formating responsed data from Neo4j server for knowledge graph building data
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

//Echart configuration for building knowledge graph
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
                        //vm.$data.target_type = tmp_name;
                        vm.$data.targets.push({"type":tmp_name,"content":''});
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
                        vm.$data.conditions.push({"type": tmp_name, "content":''});
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

//Echart configuration, draw force graph with responsed pre-processed result.
function GenerateGraph(auto){
    var myChart = echarts.init(document.getElementById('main'));
    myChart.showLoading();
    myChart.hideLoading();
    option = {
        // tooltip:{
        //     formatter: function(param){
        //         var str = new String();
        //         for (var property in param.data.properties){
        //             //str += (property + ": " + para.data.properties[property]+"<br/>"); 
        //             if (param.data.properties[property].length>50){
                        
        //                 str += (property + ": "+param.data.properties[property].substr(0,50)+"...<br/>");
        //             }else{
        //                 str += (property + ": " + param.data.properties[property]+"<br/>");
        //             }
                    
        //         }
        //         //console.log(str);
        //         return str;
        //     }
        // },
        
        series: [{
            type: 'graph',
            layout: 'force',
            symbolSize: 30,
            animation: true,
            roam: true,
            label: {
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
            data: auto.nodes.map(function(node){
                return {
                    id: node.id,
                    //针对不同实体需要重构name！！！！！！
                    //针对不同实体需要重构name！！！！！！
                    //针对不同实体需要重构name！！！！！！
                    //重要的事情说三遍！！！！！！！！！！
                    name: node.properties.name,
                    properties: node.properties
                }
            }),
            force: {
                // initLayout: 'circular'
                // repulsion: 20,
                edgeLength: 200,
                repulsion: 300,
                gravity: 0.1
            },
            links: auto.links
        }]
    };

    myChart.setOption(option);
    // _myChart.on('click', function (params) {
    //     for (var property in params.data.properties){
    //         console.log(params.data.properties[property]);
    //     }
    // });
}

function Seperater(json_array){
    let res = [];
    json_array.forEach(function(json){
        res.push(json.type);
    });
    return res;
}

//Construct Cypher clause according to inputed conditions
function BuildCypher(conditions, targets){
    let path = SearchPath(Seperater(conditions),Seperater(targets),globle_adjTable);
    let left_path = new String();
    let right_path = new String();
    let path_clause = new String();
    let where_middle_clause = new String();
    let where_clause = new String();
    //缺少判断path是否为空(已解决)
    if(path[0] != undefined){
        path[0].forEach(function(path_array){
            if(path_array[2] == '>'){
                left_path = '('+path_array[0]+':'+path_array[0]+')'+ ' <' +'- [:' + path_array[1] + '] -' + left_path;
            }else{
                left_path = ' ('+path_array[0]+':'+path_array[0]+')' + '- [:' + path_array[1] + '] - ' + '>' + left_path;
            }
        });
    }
    if(path[1] != undefined){
        path[1].forEach(function(path_array){
            if(path_array[2] == '>'){
                right_path += ' - [:' + path_array[1] + '] -' + path_array[2] + '('+path_array[0]+':'+path_array[0]+')';
            }else{
                right_path += ' '+path_array[2] + '- [:' + path_array[1] + '] - ' + '('+path_array[0]+':'+path_array[0]+')';
            }
        });
    }

    path_clause = left_path + '('+conditions[0]['type']+':'+ conditions[0]['type']+')' + right_path;

    conditions.concat(targets).forEach(function(pair){
        if(pair.content != ''){
            where_middle_clause += pair.type + '.name =~ ' + '\".*' + pair.content + '.*\" and '
        }
    });
    
    where_clause = ' where ' + where_middle_clause.substring(0,where_middle_clause.length-4) + ' return p'
    
    let final_clause = 'match p=' + path_clause + where_clause;
    return final_clause; 
}

//return path(Array) with given adjcency table and soure target pair
// function SearchPath(source, target, adjTable){
//     //map = new Map();
//     let path = [];
//     let stack = [];
//     let visited = new Set();
//     let pre_depth = 0;
//     visited.add(source);
//     adjTable.get(source).forEach(function(str_link){
//         stack.push([str_link,1]);
//     });
//     while (stack.length!=0){
//         //console.log(stack);
//         let pop_array = stack.pop();
//         let cur_depth = pop_array[1];
//         let pop_res = pop_array[0].split('/');
//         let v = pop_res[0];
//         if (cur_depth <= pre_depth){
//             for (let i = 0;i < (pre_depth - cur_depth + 1);i++){
//                 path.pop();
//             }
//         }
//         pre_depth = cur_depth;
//         if (!visited.has(v)){
//             visited.add(v);
//             path.push(pop_res);
//             if (v == target){
//                 //console.log(path);
//                 return path;
//             }
//             adjTable.get(v).forEach(function(str_link){
//                 if (!visited.has(str_link.split('/')[0])){
//                     stack.push([str_link,cur_depth+1]);
//                 }
//             });
//         }
//     }
// }

function SearchPath(source, target, adjTable){
    let targets_set = new Set(source.concat(target));
    let path = [];
    let all_path = [];
    let stack = [];
    let visited = new Set();
    let pre_depth = 0;
    let find_depth = 0;
    visited.add(source[0]);
    targets_set.delete(source[0]);
    adjTable.get(source[0]).forEach(function(str_link){
        stack.push([str_link,1]);
    });
    
    while (stack.length!=0){
        if (targets_set.size == 0){
            if (path.length != 0)
                all_path.push(path);
            return all_path;
        }

        let pop_array = stack.pop();
        let cur_depth = pop_array[1];
        let pop_res = pop_array[0].split('/');
        let v = pop_res[0];

        if (cur_depth <= pre_depth){
            if (cur_depth == 1){
                for (let i = 0;i < pre_depth - find_depth;i++){
                    path.pop();
                }
                if(path.length != 0)
                    all_path.push(path);
                find_depth = 0;
                path = [];
            }else{
                for (let i = 0;i < (pre_depth - cur_depth + 1);i++){
                    path.pop();
                }
            }
        }

        pre_depth = cur_depth;

        if (!visited.has(v)){
            visited.add(v);
            path.push(pop_res);
            if (targets_set.has(v)){
                find_depth = pop_array[1];
                targets_set.delete(v);
            }
            adjTable.get(v).forEach(function(str_link){
                if (!visited.has(str_link.split('/')[0])){
                    stack.push([str_link,cur_depth+1]);
                }
            });
        }
    }
}

//Generate adjcency table given pre-processed json data
function GenerateAdjTable(graph){
    let adjTable = new Map();
    graph.links.forEach(function(link){
        if (!adjTable.has(link.source)){
            source_tmp = new Set();
            source_tmp.add(link.target+'/'+link.value+'/>');
            adjTable.set(link.source, source_tmp);
        }else{
            adjTable.set(link.source, adjTable.get(link.source).add(link.target+'/'+link.value+'/>'));
        }

        if (!adjTable.has(link.target)){
            target_tmp = new Set();
            target_tmp.add(link.source+'/'+link.value+'/<');
            adjTable.set(link.target, target_tmp);
        }else{
            adjTable.set(link.target, adjTable.get(link.target).add(link.source+'/'+link.value+'/<'));
        }
    });
    return adjTable;
}
