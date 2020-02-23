import Vue from 'vue'
import VueRouter from 'vue-router'
import New from '../views/New.vue'
import List from '../views/List.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'New',
    component: New
  },
  {
    path: '/list',
    name: 'List',
    component: List
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
