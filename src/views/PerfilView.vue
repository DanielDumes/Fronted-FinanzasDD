<!-- src/views/PerfilView.vue -->
<template>
  <div class="page active">
    <div class="container">

      <div class="page-title">Perfil</div>
      <div class="page-sub">Información de tu cuenta</div>

      <div class="profile-card">
        <div class="profile-avatar">
          {{ authStore.user?.nombre?.[0]?.toUpperCase() }}
        </div>
        <div class="profile-name">{{ authStore.user?.nombre }}</div>
        <div class="profile-email">{{ authStore.user?.email }}</div>

        <div class="profile-row">
          <div class="profile-row-label">Nombre</div>
          <div class="profile-row-value">{{ authStore.user?.nombre }}</div>
        </div>
        <div class="profile-row">
          <div class="profile-row-label">Email</div>
          <div class="profile-row-value">{{ authStore.user?.email }}</div>
        </div>

        <button class="btn-logout" style="padding:10px 20px;font-size:12px" @click="handleLogout">
          Cerrar sesión
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router    = useRouter()

function handleLogout() {
  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>