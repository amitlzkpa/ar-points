import store from '@/store';

function pipeline(to, from, final, guards) {
  let idx = -1;
  let nxt = (args) => {
    if (typeof args !== 'undefined') return final(args);
    if (idx === guards.length - 1) return final();
    idx++;
    return guards[idx](to, from, nxt);
  };
  return nxt();
}


function authGuard(to, from, next) {
  if (store.state.user) return next();
  return next("/404");
}

function adminGuard(to, from, next) {
  if (store.state.user && store.state.user.permissions.admin) return next();
  else return next("/401");
}

function redirectToDashboard(to, from, next) {
  if (store.state.user) return next('/dashboard');
  return next();
}


export default {
  pipeline,
  authGuard,
  adminGuard,
  redirectToDashboard
};