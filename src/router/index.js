import Vue from 'vue';
import VueRouter from 'vue-router';

import guards from '@/router/guards';

import Home from "@/pages/Home.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Project from "@/pages/Project.vue";
import Admin from "@/pages/Admin.vue";
import Page404 from "@/pages/Page404.vue";
import Page401 from "@/pages/Page401.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: 'Home',
    component: Home,
    meta: {
      title: route => "App: Home",
      guards: [ guards.redirectToDashboard ]
    },
    props: true
  },
  {
    path: "/dashboard",
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: route => "App: Dashboard",
      guards: [ guards.authGuard ]
    },
    props: true
  },
  {
    path: "/project/:id",
    name: 'Project',
    component: Project,
    meta: {
      title: route => "App: Project",
      guards: [ guards.authGuard ]
    },
    props: true
  },
  {
    path: "/admin",
    name: 'Admin',
    component: Admin,
    meta: {
      title: route => "App: Admin",
      guards: [ guards.authGuard, guards.adminGuard ]
    },
    props: true
  },
  {
    // catch all 404
    path: "/404",
    component: Page404,
    meta: {
      title: route => "App: Unknown"
    }
  },
  {
    // not authorized
    path: "/401",
    component: Page401,
    meta: {
      title: route => "App: NotAuthorized"
    }
  }
];

const router = new VueRouter({
  mode: 'history',
  routes: routes
});

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title(to);
  }
  if (!to.meta.guards || to.meta.guards.length < 1) return next();
  return guards.pipeline(to, from, next, to.meta.guards);
});

export default router;