import { createRouter, createWebHistory } from 'vue-router'
import DecisionCenter from '@/views/DecisionCenter.vue'
import DietDiary from '@/views/DietDiary.vue'
import Statistics from '@/views/Statistics.vue'
import Settings from '@/views/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'decision',
      component: DecisionCenter
    },
    {
      path: '/diary',
      name: 'diary',
      component: DietDiary
    },
    {
      path: '/stats',
      name: 'stats',
      component: Statistics
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
})

export default router
