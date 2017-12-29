<template>
  <div id="resultVue">
      <el-tabs type="border-card">
        <el-tab-pane label="Graph">
          <el-container>
            <el-aside width="30%">
              <el-table :data="expandable_data" style="width:100%" height="800">
                <el-table-column type="expand">
                  <template scope="props">
                    <div v-for="(value, key) in props.row" :key="key">
                      <p>{{key}}:{{value}}</p>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="Name" :prop="prop_name">
                </el-table-column>
              </el-table>
            </el-aside>
            <el-main>
              <div id="main" style="height:800px"></div>
            </el-main>
          </el-container>

        </el-tab-pane>
        <el-tab-pane label="Table">
          <template>
            <el-table style="width: 100%" height="800" border>
              <el-table-column prop="type" label="Type" width="180">
              </el-table-column>
              <el-table-column prop="properties" label="Properties">
              </el-table-column>
            </el-table>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
</template>

<script>
  export default {};
</script>

<style>
</style>