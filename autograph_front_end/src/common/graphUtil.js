/**
 * 将查询结果原始数据处理成echarts需要的数据格式
 *
 * @param {any} rawjson 从neo4j接口获得的原始数据，数据结构详见数据结构文档
 * @returns 返回echarts要求的数据格式
 */
export function RawjsonProcessor(rawjson) {
  let idSet = new Set();
  let edgeSet = new Set();
  let nodes = [];
  let edges = [];
  resultVue.$data.table_data = [];
  rawjson.results['0'].data.forEach(function (rawGraph) {
    rawGraph.graph.nodes.forEach(function (rawNode) {
      rawNode.id = parseInt(rawNode.id);
      if (!idSet.has(rawNode.id)) {
        idSet.add(rawNode.id);
        nodes.push(rawNode);
        // push data to table_data in order to display in table format
        resultVue.$data.table_data.push({'type': rawNode.labels[0], 'properties': JSON.stringify(rawNode.properties)});
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
