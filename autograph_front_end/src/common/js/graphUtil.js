import store from '@/store/store';
/**
 * 将查询结果原始数据处理成echarts需要的数据格式
 *
 * @param {any} rawjson 从neo4j接口获得的原始数据，数据结构详见数据结构文档
 * @returns 返回echarts要求的数据格式
 */
export function RawjsonProcessor (rawjson) {
  let idSet = new Set();
  let edgeSet = new Set();
  let nodes = [];
  let edges = [];
  rawjson.results['0'].data.forEach(function (rawGraph) {
    rawGraph.graph.nodes.forEach(function (rawNode) {
      rawNode.id = parseInt(rawNode.id);
      if (!idSet.has(rawNode.id)) {
        idSet.add(rawNode.id);
        nodes.push(rawNode);
        // push data to table_data in order to display in table format
        // resultVue.$data.table_data.push({'type': rawNode.labels[0], 'properties': JSON.stringify(rawNode.properties)});
        store.commit('PUSH_MESSAGE', {'type': rawNode.labels[0], 'properties': JSON.stringify(rawNode.properties)});
      }
    });
    rawGraph.graph.relationships.forEach(function (rawEdge) {
      rawEdge.id = parseInt(rawEdge.id);
      if (!edgeSet.has(rawEdge.id)) {
        edgeSet.add(rawEdge.id);
        let newEdge = { 'value': rawEdge.type, 'source': rawEdge.startNode, 'target': rawEdge.endNode };
        edges.push(newEdge);
      }
    });
  });
  return { 'nodes': nodes, 'links': edges };
}
/**
 * 将从neo4j查询到的原始数据格式化成echarts需求格式
 * 需要注意，该函数处理的是用来生成知识图谱的数据，不是查询数据
 * @param {any} rawjson 数据结构详见结构文档
 * @returns
 */
export function FixedDataProcessor (rawjson) {
  let edges = [];
  let nodes = [];
  let nodeSet = new Set();
  rawjson.results['0'].data.forEach(function (relationship) {
    // console.log(relationship.row[2]);
    let newEdge = {
      'source': relationship.row[0][0],
      'target': relationship.row[1][0],
      'value': relationship.row[2]
    };
    nodeSet.add(relationship.row[0][0]);
    nodeSet.add(relationship.row[1][0]);
    edges.push(newEdge);
  });
  nodeSet.forEach(function (node) {
    nodes.push({ 'name': node });
  });
  return { 'nodes': nodes, 'links': edges };
}
/**
 * 通过echarts绘制图谱，并利用echarts的graphic接口自定义选取控件
 *
 * @param {any} knowledge 预处理成echarts格式的图谱数据
 * @param {any} _fixedChart 在外部init的echarts实例
 */
export function GenerateFixedGraph (knowledge, _fixedChart) {
  _fixedChart.hideLoading();
  let option = {
    title: {
      text: 'Auto Knowledge Graph Query System'
    },
    // controll panel for choosing condition or target
    graphic: [
      {
        type: 'group',
        bounding: 'all',
        right: 50 + 70,
        top: 50,
        // invisible: true,
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
            type: 'sector',
            id: 'right_ring',
            invisible: true,
            shape: {
              r: 70,
              r0: 50,
              startAngle: -Math.PI / 2,
              endAngle: Math.PI / 2
            },
            left: '100%',
            top: 'center',
            style: {
              fill: '#F0F8FF'
            },
            /**
             * 当鼠标over右半圈时将右半圈变色
             *
             */
            onmouseover: function () {
              _fixedChart.setOption({
                graphic: {
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
            onmouseout: function () {
              _fixedChart.setOption({
                graphic: {
                  id: 'right_ring',
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
            onclick: function () {
              // vm.$data.targets.push({ 'type': tmp_name, 'content': '' });
              store.commit('PUSH_TARGET', { 'type': store.state.tmpName, 'content': '' });
              _fixedChart.setOption({
                graphic: [
                  {
                    id: 'left_ring',
                    invisible: true
                  },
                  {
                    id: 'right_ring',
                    invisible: true
                  },
                  {
                    id: 'text',
                    invisible: true
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
            type: 'sector',
            id: 'left_ring',
            invisible: true,
            shape: {
              r: 70,
              r0: 50,
              startAngle: Math.PI / 2,
              endAngle: Math.PI * 1.5
            },
            right: '50%',
            top: 'center',
            style: {
              fill: '#F0F8FF'
            },
            /**
             * 鼠标移入左半圈时使左半圈变色
             *
             */
            onmouseover: function () {
              _fixedChart.setOption({
                graphic: {
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
            onmouseout: function () {
              _fixedChart.setOption({
                graphic: {
                  id: 'left_ring',
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
            onclick: function () {
              // vm.$data.source_type = tmp_name;
              // vm.$data.conditions.push({ 'type': tmp_name, 'content': '' });
              store.commit('PUSH_CONDITION', { 'type': store.state.tmpName, 'content': '' });
              _fixedChart.setOption({
                graphic: [
                  {
                    id: 'left_ring',
                    invisible: true
                  },
                  {
                    id: 'right_ring',
                    invisible: true
                  },
                  {
                    id: 'text',
                    invisible: true
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
    // Config for force graph
    series: [{
      type: 'graph',
      layout: 'force',
      symbolSize: 30,
      animation: true,
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
          formatter: '{c}'
        }
      },
      edgeSymbol: [null, 'arrow'],
      draggable: true,
      data: knowledge.nodes,
      links: knowledge.links,
      // 主要通过调节以下参数，获得良好的力引导布局
      force: {
        edgeLength: 100,
        repulsion: 400,
        gravity: 0.01
      }
    }]
  };
  _fixedChart.setOption(option);
  // 双击图表中节点时显示选取控件
  _fixedChart.on('dblclick', function (params) {
    // tmp_name = params.data.name;
    store.commit('SET_TMPNAME', params.data.name);
    _fixedChart.setOption({
      graphic: [
        {
          id: 'left_ring',
          invisible: false
        },
        {
          id: 'right_ring',
          invisible: false
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
/**
 * fiter to reduce nodes in queried results
 * @param {*} nodeArray
 * @param {*} linkArray
 */
export function Filter (nodeArray, linkArray) {
  let freqMap = new Map();
  let vipFreqMap = new Map();
  let resIdSet = new Set();
  let limit = 50;
  let freqSum = 0;
  let filteredNodes = [];
  for (let link of linkArray) {
    if (freqMap.has(link.source)) {
      freqMap.set(link.source, freqMap.get(link.source) + 1);
    } else {
      freqMap.set(link.source, 1);
    }
    if (freqMap.has(link.target)) {
      freqMap.set(link.target, freqMap.get(link.target) + 1);
    } else {
      freqMap.set(link.target, 1);
    }
  }
  for (let [key, freq] of freqMap) {
    if (freq > 5) {
      vipFreqMap.set(key, freq);
      resIdSet.add(key);
      freqSum += freq;
    }
  }
  if (limit < freqSum) {
    for (let [key, freq] of vipFreqMap) {
      vipFreqMap.set(key, Math.ceil(freq * (limit / freqSum)));
    }
  }

  for (let link of linkArray) {
    if (vipFreqMap.has(link.source) && vipFreqMap.get(link.source) > 0) {
      resIdSet.add(link.target);
      vipFreqMap.set(link.source, vipFreqMap.get(link.source) - 1);
    }
    if (vipFreqMap.has(link.target) && vipFreqMap.get(link.target) > 0) {
      resIdSet.add(link.source);
      vipFreqMap.set(link.target, vipFreqMap.get(link.target) - 1);
    }
  }
  for (let node of nodeArray) {
    if (resIdSet.has((node.id).toString())) {
      filteredNodes.push(node);
    }
  }
  return filteredNodes;
}

/**
 * 通过echarts将预处理过的查询数据渲染成力引导布局图
 *
 * @param {any} auto 预处过的查询数据
 */
export function GenerateGraph (auto, myChart) {
  // var myChart = echarts.init(document.getElementById('main'));
  // _myChart.showLoading();
  myChart.hideLoading();
  let option = {
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
          formatter: '{c}'
        }
      },
      edgeSymbol: [null, 'arrow'],
      draggable: true,
      data: Filter(auto.nodes, auto.links).map(function (node) {
        return {
          id: node.id,
          // 针对不同实体需要重构name！！！！！！
          // 针对不同实体需要重构name！！！！！！
          // 针对不同实体需要重构name！！！！！！
          // 重要的事情说三遍！！！！！！！！！！
          name: node.properties.name,
          properties: node.properties
        };
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
      // 主要通过以下参数获得良好可视化效果，还可以再优化
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
    resultVue.$data.prop_name = 'name';
    resultVue.$data.expandable_data = [];
    resultVue.$data.expandable_data.push(params.data.properties);
  });
}
/**
 * 将conditions和targets中的type抽取出来并返回数组
 * @param {any} jsonArray
 * @returns
 */
function Seperater (jsonArray) {
  let res = [];
  jsonArray.forEach(function (json) {
    res.push(json.type);
  });
  return res;
}

// Construct Cypher clause according to inputed conditions
/**
 * 根据查询条件，调用searchpath函数获取路径，拼接出对应的cypher语句
 * 需要注意，因为可以多点查询，当起始点在中间时，会有左路径和右路径之分，拼接左右路径时箭头的方向会有区别
 * @param {any} conditions vue datamodel里的conditons
 * @param {any} targets vue datamodel里的targets
 * @returns
 */
export function BuildCypher (conditions, targets, globleAdjTable) {
  let path = SearchPath(Seperater(conditions), Seperater(targets), globleAdjTable);
  let leftPath = '';
  let rightPath = '';
  let pathClause = '';
  let whereMiddleClause = '';
  let whereClause = '';
  // 缺少判断path是否为空(已解决)
  if (path[0] !== undefined) {
    path[0].forEach(function (pathArray) {
      if (pathArray[2] === '>') {
        leftPath = '(' + pathArray[0] + ':' + pathArray[0] + ')' + ' <' + '- [:' + pathArray[1] + '] -' + leftPath;
      } else {
        leftPath = ' (' + pathArray[0] + ':' + pathArray[0] + ')' + '- [:' + pathArray[1] + '] - ' + '>' + leftPath;
      }
    });
  }
  if (path[1] !== undefined) {
    path[1].forEach(function (pathArray) {
      if (pathArray[2] === '>') {
        rightPath += ' - [:' + pathArray[1] + '] -' + pathArray[2] + '(' + pathArray[0] + ':' + pathArray[0] + ')';
      } else {
        rightPath += ' ' + pathArray[2] + '- [:' + pathArray[1] + '] - ' + '(' + pathArray[0] + ':' + pathArray[0] + ')';
      }
    });
  }

  pathClause = leftPath + '(' + conditions[0]['type'] + ':' + conditions[0]['type'] + ')' + rightPath;

  conditions.concat(targets).forEach(function (pair) {
    if (pair.content !== '') {
      whereMiddleClause += pair.type + '.name =~ ' + '\".*' + pair.content + '.*\" and '
    }
  });

  whereClause = ' where ' + whereMiddleClause.substring(0, whereMiddleClause.length - 4) + ' return p'

  let finalClause = 'match p=' + pathClause + whereClause;
  return finalClause;
}
/**
 * 利用dfs以source数组中的第一个元素为起点寻找所有的targets，通过在dfs时记录深度，从而获得转折点，并得到路径
 * 需要注意，这个函数可以获取子图，在buildpath函数中最好加入判断，使路径为线性结构
 * @param {any} source 包含所有选中的查询条件
 * @param {any} target 包含所有选中的查询目标
 * @param {any} adjTable 无向图邻接表
 * @returns
 */
function SearchPath (source, target, adjTable) {
  let targetsSet = new Set(source.concat(target));
  let path = [];
  let allPath = [];
  let stack = [];
  let visited = new Set();
  let preDepth = 0;
  let findDepth = 0;
  visited.add(source[0]);
  targetsSet.delete(source[0]);
  adjTable.get(source[0]).forEach(function (strLink) {
    stack.push([strLink, 1]);
  });

  while (stack.length !== 0 || path.length !== 0) {
    if (targetsSet.size === 0) {
      if (path.length !== 0) {
        allPath.push(path);
      }
      return allPath;
    }

    let popArray = stack.pop();
    let curDepth = popArray[1];
    let popRes = popArray[0].split('/');
    let v = popRes[0];

    if (curDepth <= preDepth) {
      if (curDepth === 1) {
        for (let i = 0; i < preDepth - findDepth; i++) {
          path.pop();
        }
        if (path.length !== 0) {
          allPath.push(path);
        }
        findDepth = 0;
        path = [];
      } else {
        for (let i = 0; i < (preDepth - curDepth + 1); i++) {
          path.pop();
        }
      }
    }

    preDepth = curDepth;

    if (!visited.has(v)) {
      visited.add(v);
      path.push(popRes);
      if (targetsSet.has(v)) {
        findDepth = popArray[1];
        targetsSet.delete(v);
      }
      adjTable.get(v).forEach(function (strLink) {
        if (!visited.has(strLink.split('/')[0])) {
          stack.push([strLink, curDepth + 1]);
        }
      });
    }
  }
}
// Generate adjcency table given pre-processed json data
/**
 * 将预处理过的图谱数据转化成无向图邻接表
 * 需要注意，用无向图邻接表是为了双向查询
 * @param {any} graph
 * @returns
 */
export function GenerateAdjTable (graph) {
  let adjTable = new Map();
  graph.links.forEach(function (link) {
    if (!adjTable.has(link.source)) {
      let sourceTmp = new Set();
      sourceTmp.add(link.target + '/' + link.value + '/>');
      adjTable.set(link.source, sourceTmp);
    } else {
      adjTable.set(link.source, adjTable.get(link.source).add(link.target + '/' + link.value + '/>'));
    }

    if (!adjTable.has(link.target)) {
      let targetTmp = new Set();
      targetTmp.add(link.source + '/' + link.value + '/<');
      adjTable.set(link.target, targetTmp);
    } else {
      adjTable.set(link.target, adjTable.get(link.target).add(link.source + '/' + link.value + '/<'));
    }
  });
  return adjTable;
}
