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
  export default {};
</script>

<style>
</style>