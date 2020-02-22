import Vue from 'vue'
import VueRouter from 'vue-router'
import New from '../views/New.vue'
import Play from '../views/Play.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'New',
    component: New
  },
  {
    path: '/play',
    name: 'Play',
    component: Play
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
