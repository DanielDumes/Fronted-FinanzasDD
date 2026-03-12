<!-- src/views/VerificarView.vue -->
<template>
  <div class="auth-wrap">
    <div class="auth-card" style="text-align:center">

      <div v-if="loading">
        <div style="font-size:48px;margin-bottom:16px">⏳</div>
        <div class="auth-logo">Fin<span>Flow</span></div>
        <p style="color:var(--text2);margin-top:12px">Verificando tu cuenta...</p>
        <span class="loader" style="margin-top:16px"></span>
      </div>

      <div v-else-if="success">
        <div style="font-size:48px;margin-bottom:16px">✅</div>
        <div class="auth-logo">Fin<span>Flow</span></div>
        <p style="color:var(--text2);margin-top:12px;margin-bottom:28px">
          ¡Tu cuenta ha sido verificada exitosamente!
        </p>
        <button class="btn-primary" @click="router.push('/login')">
          Iniciar sesión
        </button>
      </div>

      <div v-else>
        <div style="font-size:48px;margin-bottom:16px">❌</div>
        <div class="auth-logo">Fin<span>Flow</span></div>
        <p style="color:var(--red);margin-top:12px;margin-bottom:28px">
          {{ error }}
        </p>
        <button class="btn-primary" @click="router.push('/login')">
          Volver al inicio
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

const router  = useRouter()
const route   = useRoute()
const loading = ref(true)
const success = ref(false)
const error   = ref('')

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    loading.value = false
    error.value   = 'Token de verificación no encontrado.'
    return
  }
  try {
    await api.get(`/auth/verificar?token=${token}`)
    success.value = true
  } catch (err) {
    error.value = err.message || 'Token inválido o expirado.'
  } finally {
    loading.value = false
  }
})
</script>