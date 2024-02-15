import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:recordId?',
      name: 'home',
      component: HomeView
    },
    {
      path: '/cmm',
      name: 'cmm',
      component: () => import('../views/CmmView.vue')
    },
    {
      path: '/editor/:recordId?',
      name: 'editor',
      component: () => import('../views/EditorView.vue')
    },
    {
      path: '/memorandumversion/:recordId?',
      name: 'memorandumversion',
      component: () => import('../views/MemorandumView.vue')
    },
    {
      path: '/versionselect/:recordId?',
      name: 'versionselect',
      component: () => import('../views/VersionSelectorView.vue')
    }
  ]
});

export default router
