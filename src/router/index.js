// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView    from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import GraficasView  from '../views/GraficasView.vue'
import PerfilView    from '../views/PerfilView.vue'
import MetasView from '../views/MetasView.vue'
import PresupuestosView from '../views/PresupuestosView.vue'
const routes = [
  { path: '/',         redirect: '/dashboard' },
  { path: '/login',    component: LoginView,     meta: { guest: true } },
  { path: '/register', component: RegisterView,  meta: { guest: true } },
  { path: '/dashboard',component: DashboardView, meta: { auth: true } },
  { path: '/graficas', component: GraficasView,  meta: { auth: true } },
  { path: '/perfil',   component: PerfilView,    meta: { auth: true } },
  {path: '/metas', component: MetasView,         meta: {auth: true}},
{ path: '/presupuestos', component: PresupuestosView, meta: { auth: true } },]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard de navegación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuth    = authStore.isAuthenticated()

  if (to.meta.auth && !isAuth) return next('/login')
  if (to.meta.guest && isAuth)  return next('/dashboard')
  next()
})

export default router