<template>
  <div id="graph_holder">  
  </div>
</template>

<script>
  import echarts from 'echarts';
  import {BuildCypher} from '@/common/js/graphUtil';
  import {GenerateFixedGraph} from '@/common/js/graphUtil';
  import {FixedDataProcessor} from '@/common/js/graphUtil';
  import {GenerateAdjTable} from '@/common/js/graphUtil';
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
       * 通过固定cypher语句，获取知识图谱包涵的所有节点类别和它们的关系，调用函数可视化图谱，并生成邻接表
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
          // globle_adjTable = GenerateAdjTable(FixedDataProcessor(res.body));
          this.$store.commit('SET_GLOBLEADJ', GenerateAdjTable(FixedDataProcessor(res.body)));
          // console.log(BuildCypher([{'type':'Brand','content':'condi'},{'type':'Model', 'content':' '},{'type':'Masterbrand', 'content':'condi'}],[{'type':'Dealer', 'content':' '}]));
        });
      }
    }
  };
</script>
  
<style>
</style>