// src/stores/budgets.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useBudgetStore = defineStore('budgets', () => {
  const budgets = ref([])
  const loading = ref(false)

  async function fetchBudgets(mes, anio) {
    loading.value = true
    try {
      const res = await api.get(`/budgets?mes=${mes}&anio=${anio}`)
      budgets.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function createBudget(payload) {
    const res = await api.post('/budgets', payload)
    const idx = budgets.value.findIndex(
      b => b.categoria === payload.categoria
    )
    if (idx !== -1) budgets.value[idx] = res.data
    else budgets.value.push(res.data)
    return res.data
  }

  async function deleteBudget(id) {
    await api.delete(`/budgets/${id}`)
    budgets.value = budgets.value.filter(b => b._id !== id)
  }

  return { budgets, loading, fetchBudgets, createBudget, deleteBudget }
})