<!-- src/views/RegisterView.vue -->
<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">Fin<span>Flow</span></div>
      <div class="auth-sub">Crea tu cuenta gratis</div>

      <div v-if="error" class="alert error show">{{ error }}</div>

      <div class="form-group">
        <label>Nombre</label>
        <input v-model="nombre" type="text" placeholder="Tu nombre" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="tu@email.com" />
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <input v-model="password" type="password" placeholder="Mínimo 6 caracteres" @keyup.enter="handleRegister" />
      </div>

      <button class="btn-primary" @click="handleRegister" :disabled="loading">
        <span v-if="loading" class="loader"></span>
        {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
      </button>

      <div class="auth-switch">
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const nombre   = ref('')
const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')

async function handleRegister() {
  if (!nombre.value || !email.value || !password.value) {
    error.value = 'Completa todos los campos'
    return
  }
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  loading.value = true
  error.value   = ''
  try {
    await authStore.register(nombre.value, email.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>