// src/stores/goals.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useGoalStore = defineStore('goals', () => {
  const goals   = ref([])
  const loading = ref(false)

  async function fetchGoals() {
    loading.value = true
    try {
      const res = await api.get('/goals')
      goals.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function createGoal(payload) {
    const res = await api.post('/goals', payload)
    goals.value.unshift(res.data)
    return res.data
  }

  async function abonarGoal(id, monto) {
    const res = await api.put(`/goals/${id}/abonar`, { monto })
    const idx = goals.value.findIndex(g => g._id === id)
    if (idx !== -1) goals.value[idx] = res.data
    return res.data
  }

  async function deleteGoal(id) {
    await api.delete(`/goals/${id}`)
    goals.value = goals.value.filter(g => g._id !== id)
  }

  return { goals, loading, fetchGoals, createGoal, abonarGoal, deleteGoal }
})