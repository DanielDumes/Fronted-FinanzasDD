// src/stores/transactions.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref([])
  const resumen      = ref(null)
  const loading      = ref(false)

  const totalIngresos = computed(() =>
    transactions.value
      .filter(t => t.tipo === 'ingreso')
      .reduce((s, t) => s + t.monto, 0)
  )

  const totalEgresos = computed(() =>
    transactions.value
      .filter(t => t.tipo === 'egreso')
      .reduce((s, t) => s + t.monto, 0)
  )

  const balance = computed(() => totalIngresos.value - totalEgresos.value)

  async function fetchTransactions(mes, anio) {
    loading.value = true
    try {
      const res = await api.get(`/transactions?mes=${mes}&anio=${anio}`)
      transactions.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchResumen(anio) {
    const res = await api.get(`/transactions/resumen?anio=${anio}`)
    resumen.value = res.data
  }

  async function createTransaction(payload) {
    const res = await api.post('/transactions', payload)
    transactions.value.unshift(res.data)
    return res.data
  }

  async function deleteTransaction(id) {
    await api.delete(`/transactions/${id}`)
    transactions.value = transactions.value.filter(t => t._id !== id)
  }

  async function updateTransaction(id, payload) {
  const res = await api.put(`/transactions/${id}`, payload)
  const idx = transactions.value.findIndex(t => t._id === id)
  if (idx !== -1) transactions.value[idx] = res.data
  return res.data
}

  return {
    transactions, resumen, loading,
    totalIngresos, totalEgresos, balance,
    fetchTransactions, fetchResumen, createTransaction, deleteTransaction, updateTransaction
  }
})