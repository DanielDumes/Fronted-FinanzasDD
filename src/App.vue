<!-- src/App.vue -->
<template>
  <div>
    <nav class="navbar" v-if="authStore.isAuthenticated()">
      <div class="nav-logo">Finanzas<span>DD</span></div>

      <div class="nav-links">
        <router-link class="nav-link" to="/dashboard"    active-class="active">Dashboard</router-link>
        <router-link class="nav-link" to="/graficas"     active-class="active">Gráficas</router-link>
        <router-link class="nav-link" to="/metas"        active-class="active">Metas</router-link>
        <router-link class="nav-link" to="/presupuestos" active-class="active">Presupuestos</router-link>
        <router-link class="nav-link" to="/perfil"       active-class="active">Perfil</router-link>
      </div>

      <div class="nav-right">
        <span class="nav-user-name">Hola, <span>{{ authStore.user?.nombre }}</span></span>

        <!-- Theme toggle -->
        <div class="theme-toggle-wrap">
          <span>{{ isDark ? '🌙' : '☀️' }}</span>
          <div class="theme-toggle" @click="toggleTheme"></div>
        </div>

        <button class="btn-logout" @click="handleLogout">Salir</button>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router    = useRouter()
const isDark    = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('finflow_theme')
  if (saved === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('finflow_theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('finflow_theme', 'light')
  }
}

function handleLogout() {
  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>