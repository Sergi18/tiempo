import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/forecast',
    name: 'forecast',
    component: () => import('../views/ForecastView.vue')
  },
  {
    path: '/game-single',
    name: 'game-single',
    component: () => import('../views/SinglePlayerView.vue')
  },
  {
    path: '/game-multi',
    name: 'game-multi',
    component: () => import('../views/MultiplayerView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
