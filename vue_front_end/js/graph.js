var fixed_chart = echarts.init(document.getElementById('fixed'));

var globle_adjTable;
var tmp_name;

//承载图谱显示块的vue实例
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
        /**
         * 异步加载查询数据，并调用函数可视化查询结果
         * 首先调用BuildCypher查找路径并生成对应的cypher语句，通过vue-resources异步加载数据，最后调用GenerateGraph可视化查询结果
         */
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
            }).then(res=>{
                
                GenerateGraph(RawjsonProcessor(res.body));
            });  
        },
        /**
         * 通过固定cypher语句，获取知识图谱包涵的所有节点类别和它们的关系，调用函数可视化图谱，并生成邻接表
         * 
         */
        DrawFixedGraph: function(){
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
        
        /**
         * 将选中的查询条件从conditions里删除
         * 需要注意，这里的参数en是element封装好的事件参数，无法客制，所以获取选中条件的类型是通过在dom树中查找该输入框标签得到的
         * @param {any} en 
         */
        RemoveCondition: function(en){
            console.log(en);
            let tmp_idx = this.conditions.indexOf(en.target.parentElement.children[0].innerText);
            this.conditions.splice(tmp_idx, 1);
        },
        /**
         * 将选中的查询目标从targets中删除
         * 需要注意，这里的参数en是element封装好的事件参数，无法客制，所以获取选中目标的类型是通过在dom树中查找该输入框得到的
         * @param {any} en 
         */
        RemoveTarget: function(en){
            let tmp_idx = this.targets.indexOf(en.target.parentElement.children[0].innerText);
            this.targets.splice(tmp_idx, 1);
        }        
    }
});
//控制查询结果块的vue实例
resultVue = new Vue({
    el:"#resultVue",
    data: {
        table_data: [],
        expandable_data: [{}],
        prop_name: "",
        limit: 150
    },
    methods:{
        ChangeLimit: function(param){
            myChart.setOption()
        }
    }
});
//Formating responsed data from Neo4j server for queried data

/**
 * 将查询结果原始数据处理成echarts需要的数据格式
 * 
 * @param {any} rawjson 从neo4j接口获得的原始数据，数据结构详见数据结构文档
 * @returns 返回echarts要求的数据格式
 */
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
                //push data to table_data in order to display in table format
                resultVue.$data.table_data.push({'type':raw_node.labels[0], 'properties':JSON.stringify(raw_node.properties)})
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

/**
 * 将从neo4j查询到的原始数据格式化成echarts需求格式
 * 需要注意，该函数处理的是用来生成知识图谱的数据，不是查询数据
 * @param {any} rawjson 数据结构详见结构文档
 * @returns 
 */
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

/**
 * 通过echarts绘制图谱，并利用echarts的graphic接口自定义选取控件
 * 
 * @param {any} knowledge 预处理成echarts格式的图谱数据
 * @param {any} _fixed_chart 在外部init的echarts实例
 */
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
                    /**
                     * 当鼠标over右半圈时将右半圈变色
                     * 
                     */
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
                    /**
                     * 当鼠标移出右半圈时将右半圈变色
                     * 
                     */
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
                    /**
                     * 鼠标点击右半圈时将选中目标压入vue的targets里，并隐藏选取控件
                     * 
                     */
                    onclick: function(){
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
                    /**
                     * 鼠标移入左半圈时使左半圈变色
                     * 
                     */
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
                    /**
                     * 鼠标移出左半圈时左半圈变色
                     * 
                     */
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
                    /**
                     * 鼠标点击左半圈时，将选中节点压入vue的conditions里，并隐藏选取控件
                     * 
                     */
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
                //主要通过调节以下参数，获得良好的力引导布局
                force: {
                    edgeLength: 100,
                    repulsion: 400,
                    gravity: 0.01
                }
            }]
    };
    _fixed_chart.setOption(option);
    //双击图表中节点时显示选取控件
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

function Filter(node_array,link_array){
    let freq_map = new Map();
    let vip_freq_map = new Map();
    let res_id_set = new Set();
    let limit = 50;
    let freq_sum = 0;
    let filtered_nodes = [];
    for (let link of link_array){
        if (freq_map.has(link.source)) 
            freq_map.set(link.source,freq_map.get(link.source)+1);
        else 
            freq_map.set(link.source, 1);
        if (freq_map.has(link.target))
            freq_map.set(link.target, freq_map.get(link.target)+1);
        else
            freq_map.set(link.target, 1);
    }
    for (let [key, freq] of freq_map){
        if (freq > 5){
            vip_freq_map.set(key,freq);
            res_id_set.add(key);
            freq_sum += freq;
        }
    }
    if (limit < freq_sum){
        for (let [key,freq] of vip_freq_map)
            vip_freq_map.set(key,Math.ceil(freq*(limit/freq_sum)));
    }
    
    for (let link of link_array){
        if (vip_freq_map.has(link.source)&&vip_freq_map.get(link.source)>0){
            res_id_set.add(link.target);
            vip_freq_map.set(link.source,vip_freq_map.get(link.source)-1);
        }
        if (vip_freq_map.has(link.target)&&vip_freq_map.get(link.target)>0){
            res_id_set.add(link.source);
            vip_freq_map.set(link.target,vip_freq_map.get(link.target)-1);
        }
    }
    for (let node of node_array){
        if (res_id_set.has((node.id).toString())){
            filtered_nodes.push(node);
        }       
    }
    return filtered_nodes;
}


//Echart configuration, draw force graph with responsed pre-processed result.

/**
 * 通过echarts将预处理过的查询数据渲染成力引导布局图
 * 
 * @param {any} auto 预处过的查询数据
 */
function GenerateGraph(auto){
    var myChart = echarts.init(document.getElementById('main'));
    //_myChart.showLoading();
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
            data: Filter(auto.nodes, auto.links).map(function(node){
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
            // data: auto.nodes.map(function(node){
            //     return {
            //         id: node.id,
            //         //针对不同实体需要重构name！！！！！！
            //         //针对不同实体需要重构name！！！！！！
            //         //针对不同实体需要重构name！！！！！！
            //         //重要的事情说三遍！！！！！！！！！！
            //         name: node.properties.name,
            //         properties: node.properties
            //     }
            // }),
            //主要通过以下参数获得良好可视化效果，还可以再优化
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
    myChart.on('click', function (params) {
        resultVue.$data.prop_name = "name";
        resultVue.$data.expandable_data = [];
        resultVue.$data.expandable_data.push(params.data.properties);
    });
}


/**
 * 将conditions和targets中的type抽取出来并返回数组
 * 
 * @param {any} json_array 
 * @returns 
 */
function Seperater(json_array){
    let res = [];
    json_array.forEach(function(json){
        res.push(json.type);
    });
    return res;
}

//Construct Cypher clause according to inputed conditions
/**
 * 根据查询条件，调用searchpath函数获取路径，拼接出对应的cypher语句
 * 需要注意，因为可以多点查询，当起始点在中间时，会有左路径和右路径之分，拼接左右路径时箭头的方向会有区别
 * @param {any} conditions vue datamodel里的conditons
 * @param {any} targets vue datamodel里的targets
 * @returns 
 */
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

/**
 * 利用dfs以source数组中的第一个元素为起点寻找所有的targets，通过在dfs时记录深度，从而获得转折点，并得到路径
 * 需要注意，这个函数可以获取子图，在buildpath函数中最好加入判断，使路径为线性结构
 * @param {any} source 包含所有选中的查询条件
 * @param {any} target 包含所有选中的查询目标
 * @param {any} adjTable 无向图邻接表
 * @returns 
 */
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
    
    while (stack.length!=0 || path.length != 0){
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
/**
 * 将预处理过的图谱数据转化成无向图邻接表
 * 需要注意，用无向图邻接表是为了双向查询
 * @param {any} graph 
 * @returns 
 */
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
