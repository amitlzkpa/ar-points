import Vue from 'vue';

window._ = require('lodash');
window.moment = require('moment');
window.$ = window.jQuery = require('jquery');


import '@/css/main.scss';
import '@/css/Material_Icons.css';

import store from '@/store';
import router from '@/router';
import App from '@/App.vue';
import vuetify from './plugins/vuetify';


async function main() {

  let user;
  
  try {
    let session = await $.get("/session");
    user = session.user || null;
  } catch {
    user = null;
  }
  store.commit('setUser', user);

  const app = new Vue({
    el: '#app',
    store,
    router,
    vuetify,
    render: h => h(App)
  });

}


main();