<template>
  <div id="myVue">
      <el-row :gutter="10">
        <el-col v-for="(condition, idx) in conditions" :key='idx' :span="5">
          <el-input placeholder="condition" v-model="condition.content" suffix-icon="el-icon-circle-close
        " on-icon-click="RemoveCondition">
            <template slot="prepend">
              <div>{{condition.type}}</div>
            </template>
          </el-input>
        </el-col>
      </el-row>

      <el-row :gutter="10">
        <el-col v-for="(target, idx) in targets" :key='idx' :span="5">
          <el-input placeholder="target" v-model="target.content" suffix-icon="el-icon-circle-close
        " on-icon-click="RemoveTarget">
            <template slot="prepend">
              <div>{{target.type}}</div>
            </template>
          </el-input>
        </el-col>
      </el-row>
      <el-row type="flex" justify="end">
        <el-button @click="DrawGraph">Query</el-button>
      </el-row>
    </div>
</template>

<script>
  import {BuildCypher} from '@/common/js/graphUtil';
  import {RawjsonProcessor} from '@/common/js/graphUtil';
  import {GenerateGraph} from '@/common/js/graphUtil';
  export default {
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