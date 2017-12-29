<template>
  <div id="graph_holder">  
  </div>
</template>

<script>
  import echarts from 'echarts';
  var fixedChart = echarts.init(document.getElementById('graph_holder'));
  export default {
    data: {
      conditions: [],
      targets: []
    },
    mounted: function () {
      this.DrawFixedGraph();
    },
    methods: {
      /**
       * 异步加载查询数据，并调用函数可视化查询结果
       * 首先调用BuildCypher查找路径并生成对应的cypher语句，通过vue-resources异步加载数据，最后调用GenerateGraph可视化查询结果
       */
      DrawGraph: function () {
        // console.log(BuildCypher(conditions));
        let statement = BuildCypher(this.conditions, this.targets);
        console.log(statement);
        this.$http({
          method: 'POST',
          url: 'http://localhost:7474/db/data/transaction/commit',
          body: {
            'statements': [{
              'statement': statement, // "Match p = (b:Brand)-[:BELONGS_TO]->()-[:SOLD_BY]->(d:Dealer{siteid:'1'}) return p limit 5",
              'resultDataContents': ['graph']
            }]
          },
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic bmVvNGo6cm9vdA==' }
        }).then(res => {
          GenerateGraph(RawjsonProcessor(res.body));
        });
      },
      /**
       * 通过固定cypher语句，获取知识图谱包涵的所有节点类别和它们的关系，调用函数可视化图谱，并生成邻接表
       *
       */
      DrawFixedGraph: function () {
        this.$http({
          method: 'POST',
          url: 'http://localhost:7474/db/data/transaction/commit',
          body: {
            'statements': [{
              'statement': 'match (a)-[r]->(b) return distinct labels(a),labels(b), type(r)'
            }]
          },
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic bmVvNGo6cm9vdA==' }

        }).then(res => {
          fixedChart.showLoading();
          let _fixedChart = fixedChart;
          GenerateFixedGraph(FixedDataProcessor(res.body), _fixedChart);
          globle_adjTable = GenerateAdjTable(FixedDataProcessor(res.body));
          // console.log(BuildCypher([{'type':'Brand','content':'condi'},{'type':'Model', 'content':' '},{'type':'Masterbrand', 'content':'condi'}],[{'type':'Dealer', 'content':' '}]));
        });
      },

      /**
       * 将选中的查询条件从conditions里删除
       * 需要注意，这里的参数en是element封装好的事件参数，无法客制，所以获取选中条件的类型是通过在dom树中查找该输入框标签得到的
       * @param {any} en
       */
      RemoveCondition: function (en) {
        console.log(en);
        let tmpIdx = this.conditions.indexOf(en.target.parentElement.children[0].innerText);
        this.conditions.splice(tmpIdx, 1);
      },
      /**
       * 将选中的查询目标从targets中删除
       * 需要注意，这里的参数en是element封装好的事件参数，无法客制，所以获取选中目标的类型是通过在dom树中查找该输入框得到的
       * @param {any} en
       */
      RemoveTarget: function (en) {
        let tmpIdx = this.targets.indexOf(en.target.parentElement.children[0].innerText);
        this.targets.splice(tmpIdx, 1);
      }
    }
  };
</script>
  
<style>
</style>