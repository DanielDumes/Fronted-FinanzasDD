// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('finflow_user') || 'null'))
  const token = ref(localStorage.getItem('finflow_token') || null)

  const isAuthenticated = () => !!token.value

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    token.value = res.token
    user.value  = res.user
    localStorage.setItem('finflow_token', res.token)
    localStorage.setItem('finflow_user', JSON.stringify(res.user))
    return res
  }

  async function register(nombre, email, password) {
    const res = await api.post('/auth/register', { nombre, email, password })
    token.value = res.token
    user.value  = res.user
    localStorage.setItem('finflow_token', res.token)
    localStorage.setItem('finflow_user', JSON.stringify(res.user))
    return res
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('finflow_token')
    localStorage.removeItem('finflow_user')
  }

  async function checkAuth() {
    if (!token.value) return false
    try {
      const res = await api.get('/auth/me')
      user.value = res.user
      return true
    } catch {
      logout()
      return false
    }
  }

  return { user, token, isAuthenticated, login, register, logout, checkAuth }
})