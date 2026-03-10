// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://backend-finanzas-production-5b44.up.railway.app/api',

})

// Agregar token automáticamente a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Manejar errores globalmente
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Error en la solicitud'
    return Promise.reject(new Error(message))
  }
)

export default api