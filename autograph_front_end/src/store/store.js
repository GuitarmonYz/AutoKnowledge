import Vue from 'vue';
import Vuex from 'vuex';

Vue.config.productionTip = false;

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    globalAdjTable: [],
    tmpName: '',
    table_data: [],
    targets: []
  },

  actions: {
    setTempName ({commit}, tmpName) {
      commit('SET_TMPNAME', tmpName);
    },
    setGlobleAdj ({commit}, globalAdjTable) {
      commit('SET_GLOBLEADJ', globalAdjTable);
    },
    pushMessage ({commit}, msg) {
      commit('PUSH_MESSAGE', msg);
    },
    pushTarget ({commit}, target) {
      commit('PUSH_TARGET', target);
    }
  },

  mutations: {
    SET_TMPNAME (state, tmpName) {
      state.tmpName = tmpName;
    },
    SET_GLOBLEADJ (state, globalAdjTable) {
      state.globalAdjTable = globalAdjTable;
    },
    PUSH_MESSAGE (state, msg) {
      state.table_data.push(msg);
    },
    PUSH_TARGET (state, target) {
      state.targets.push(target);
    }
  }

});
