import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: null,
    project:null
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setProject(state, project) {
      console.log("setting project at store")
      state.project = project;
  }
  },
  getters: {
    getUser: (state) => state.user,
    getProject: (state) => state.project
  },
  actions: {

  }
});

export default store;