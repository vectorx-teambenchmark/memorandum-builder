import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MemorandumView from '../views/MemorandumView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:recordId*',
      name: 'home',
      component: HomeView
    },
    {
      path: '/editor/:recordId*',
      name: 'editor',
      component: () => import('../views/EditorView.vue')
    },
    {
      path: '/memorandumversion/:recordId*',
      name: 'memorandumversion',
      component: MemorandumView
    }
  ]
})

export default router
