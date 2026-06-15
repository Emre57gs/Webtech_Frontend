import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/decks/:id',
      name: 'deck',
      component: () => import('../views/DeckView.vue'),
    },
    {
      path: '/decks/:id/quiz',
      name: 'quiz',
      component: () => import('../views/QuizView.vue'),
    },
  ],
})

export default router
