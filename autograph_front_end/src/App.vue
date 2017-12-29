<template>
  <div>
    <querygraph></querygraph>
    <querybox></querybox>
    <result></result>
  </div>
</template>

<script>
  import querygraph from 'components/querygraph/querygraph.vue';
  import querybox from 'components/querybox/querybox.vue';
  import result from 'components/result/result.vue';
  export default {
    components: {
      querygraph,
      querybox,
      result
    }
  };
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
