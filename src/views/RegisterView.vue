<!-- src/views/RegisterView.vue -->
<template>
  <div class="auth-wrap">
    <div class="auth-card">

      <!-- Mensaje de éxito -->
      <div v-if="registrado" style="text-align:center;padding:16px 0">
        <div style="font-size:48px;margin-bottom:12px">📧</div>
        <p style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:8px">¡Revisa tu email!</p>
        <p style="font-size:13px;color:var(--text2)">Te enviamos un enlace de verificación. Activa tu cuenta antes de iniciar sesión.</p>
        <div style="margin-top:24px">
          <router-link to="/login" class="btn-primary" style="display:inline-block;text-decoration:none">
            Ir al login
          </router-link>
        </div>
      </div>

      <!-- Formulario -->
      <template v-else>
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
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const nombre   = ref('')
const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')
const registrado = ref(false)

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
    const res  = await fetch('https://backend-finanzas-production-5b44.up.railway.app/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.value, email: email.value, password: password.value })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message)
    registrado.value = true
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>