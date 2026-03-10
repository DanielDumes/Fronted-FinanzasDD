<!-- src/App.vue -->
<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar" v-if="authStore.isAuthenticated()">
      <div class="nav-logo">Finanzas<span>DD</span></div>

      <!-- Desktop links -->
      <div class="nav-links">
        <router-link class="nav-link" to="/dashboard"    active-class="active">Dashboard</router-link>
        <router-link class="nav-link" to="/graficas"     active-class="active">Gráficas</router-link>
        <router-link class="nav-link" to="/metas"        active-class="active">Metas</router-link>
        <router-link class="nav-link" to="/presupuestos" active-class="active">Presupuestos</router-link>
        <router-link class="nav-link" to="/perfil"       active-class="active">Perfil</router-link>
      </div>

      <div class="nav-right">
        <span class="nav-user-name">Hola, <span>{{ authStore.user?.nombre }}</span></span>
        <div class="theme-toggle-wrap">
          <span>{{ isDark ? '🌙' : '☀️' }}</span>
          <div class="theme-toggle" @click="toggleTheme"></div>
        </div>
        <button class="btn-logout" @click="handleLogout">Salir</button>

        <!-- Hamburger móvil -->
        <button :class="['hamburger', menuOpen ? 'open' : '']" @click="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <!-- Mobile overlay -->
    <div :class="['mobile-overlay', menuOpen ? 'open' : '']" @click="menuOpen = false"></div>

    <!-- Mobile dropdown menu -->
    <div :class="['mobile-menu', menuOpen ? 'open' : '']" v-if="authStore.isAuthenticated()">
      <router-link class="mobile-menu-link" to="/dashboard"    active-class="active" @click="menuOpen = false">
        <span class="mlink-icon">📊</span> Dashboard
      </router-link>
      <router-link class="mobile-menu-link" to="/graficas"     active-class="active" @click="menuOpen = false">
        <span class="mlink-icon">📈</span> Gráficas
      </router-link>
      <router-link class="mobile-menu-link" to="/metas"        active-class="active" @click="menuOpen = false">
        <span class="mlink-icon">🎯</span> Metas
      </router-link>
      <router-link class="mobile-menu-link" to="/presupuestos" active-class="active" @click="menuOpen = false">
        <span class="mlink-icon">💰</span> Presupuestos
      </router-link>
      <router-link class="mobile-menu-link" to="/perfil"       active-class="active" @click="menuOpen = false">
        <span class="mlink-icon">👤</span> Perfil
      </router-link>

      <div class="mobile-menu-divider"></div>

      <div class="mobile-menu-bottom">
        <span class="mobile-user">Hola, <span>{{ authStore.user?.nombre }}</span></span>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="theme-toggle-wrap">
            <span>{{ isDark ? '🌙' : '☀️' }}</span>
            <div class="theme-toggle" @click="toggleTheme"></div>
          </div>
          <button class="btn-logout" @click="handleLogout">Salir</button>
        </div>
      </div>
    </div>

    <!-- Vista actual -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router    = useRouter()
const route     = useRoute()
const isDark    = ref(false)
const menuOpen  = ref(false)

// Cerrar menu al cambiar de ruta
watch(() => route.path, () => { menuOpen.value = false })

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
    menuOpen.value = false
  }
}
</script>