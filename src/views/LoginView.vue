<!-- src/views/LoginView.vue -->
<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">Finanzas<span>DD</span></div>
      <div class="auth-sub">Inicia sesión en tu cuenta</div>

      <div v-if="error" class="alert error show">{{ error }}</div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="tu@email.com" @keyup.enter="handleLogin" />
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <input v-model="password" type="password" placeholder="••••••••" @keyup.enter="handleLogin" />
      </div>

      <button class="btn-primary" @click="handleLogin" :disabled="loading">
        <span v-if="loading" class="loader"></span>
        {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
      </button>

      <div class="auth-switch">
        ¿No tienes cuenta?
        <router-link to="/register">Regístrate</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router   = useRouter()
const authStore = useAuthStore()

const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Completa todos los campos'
    return
  }
  loading.value = true
  error.value   = ''
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>