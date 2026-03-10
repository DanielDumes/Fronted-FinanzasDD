<!-- src/views/GraficasView.vue -->
<template>
  <div class="page active">
    <div class="container">

      <div class="page-title">Gráficas</div>
      <div class="page-sub">Visualización anual — {{ anio }}</div>

      <div v-if="loading" class="empty-state">
        <span class="loader"></span> Cargando...
      </div>

      <template v-else>
        <!-- Balance acumulado -->
        <div class="balance-acumulado-panel">
          <div>
            <div class="label">Balance total acumulado</div>
            <div class="sublabel">Suma de todos los meses registrados</div>
          </div>
          <div class="value" :style="{ color: balanceAcumulado >= 0 ? 'var(--accent)' : 'var(--red)' }">
            {{ fmt(Math.abs(balanceAcumulado)) }}
          </div>
        </div>

        <!-- Charts grid -->
        <div class="charts-grid">
          <div class="panel">
            <div class="panel-header">Ingresos vs Egresos por mes</div>
            <div class="chart-wrap">
              <canvas ref="barChartRef" height="220"></canvas>
            </div>
          </div>
          <div class="panel">
            <div class="panel-header">Egresos por categoría (mes actual)</div>
            <div class="chart-wrap" style="position:relative">
              <canvas ref="doughnutRef" height="260"></canvas>
              <div v-if="!hasEgresos" class="empty-state" style="position:absolute;top:0;left:0;right:0;bottom:0">
                <div class="icon">📊</div>Sin egresos este mes
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla resumen -->
        <div class="panel">
          <div class="panel-header">Resumen mensual del año</div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:12px">
              <thead>
                <tr style="border-bottom:1px solid var(--border)">
                  <th style="padding:14px 28px;text-align:left;color:var(--text3);font-weight:600;letter-spacing:.1em;text-transform:uppercase;font-size:10px">Mes</th>
                  <th style="padding:14px 28px;text-align:right;color:var(--text3);font-weight:600;letter-spacing:.1em;text-transform:uppercase;font-size:10px">Ingresos</th>
                  <th style="padding:14px 28px;text-align:right;color:var(--text3);font-weight:600;letter-spacing:.1em;text-transform:uppercase;font-size:10px">Egresos</th>
                  <th style="padding:14px 28px;text-align:right;color:var(--text3);font-weight:600;letter-spacing:.1em;text-transform:uppercase;font-size:10px">Balance</th>
                  <th style="padding:14px 28px;text-align:right;color:var(--text3);font-weight:600;letter-spacing:.1em;text-transform:uppercase;font-size:10px">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(m, i) in resumenRows"
                  :key="i"
                  style="border-bottom:1px solid var(--border)"
                  :style="{ opacity: m.ingresos === 0 && m.egresos === 0 ? 0.35 : 1 }"
                >
                  <td style="padding:13px 28px;color:var(--text2)">{{ MONTHS[m.mes - 1] }}</td>
                  <td style="padding:13px 28px;text-align:right;color:var(--green);font-variant-numeric:tabular-nums">{{ fmt(m.ingresos) }}</td>
                  <td style="padding:13px 28px;text-align:right;color:var(--red);font-variant-numeric:tabular-nums">{{ fmt(m.egresos) }}</td>
                  <td style="padding:13px 28px;text-align:right;font-variant-numeric:tabular-nums" :style="{ color: m.balance >= 0 ? 'var(--accent)' : 'var(--red)' }">
                    {{ m.balance >= 0 ? '+' : '-' }}{{ fmt(Math.abs(m.balance)) }}
                  </td>
                  <td style="padding:13px 28px;text-align:right;font-variant-numeric:tabular-nums" :style="{ color: m.acum >= 0 ? 'var(--accent)' : 'var(--red)' }">
                    {{ fmt(Math.abs(m.acum)) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTransactionStore } from '../stores/transactions'
import Chart from 'chart.js/auto'

const txStore = useTransactionStore()

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const CAT_COLORS = {
  Comida: '#ff4d6d', Transporte: '#f58844', Servicios: '#f5c844',
  Salud: '#f544b0', Entretenimiento: '#9944f5', Ropa: '#44a0f5',
  Educación: '#44f5d4', Otro: '#888888',
}

const barChartRef = ref(null)
const doughnutRef = ref(null)
const loading     = ref(false)
const anio        = new Date().getFullYear()
const mes         = new Date().getMonth() + 1

let barChart = null
let doughnut = null

const porMes = computed(() => txStore.resumen?.porMes || [])
const balanceAcumulado = computed(() => txStore.resumen?.balanceAcumulado || 0)
const hasEgresos = computed(() => txStore.transactions.filter(t => t.tipo === 'egreso').length > 0)

const resumenRows = computed(() => {
  let acum = 0
  return porMes.value.map(m => {
    const balance = m.ingresos - m.egresos
    acum += balance
    return { ...m, balance, acum }
  })
})

function fmt(n) {
  return '$' + Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function renderBarChart() {
  if (barChart) barChart.destroy()
  const labels   = porMes.value.map(m => MONTHS[m.mes - 1].slice(0, 3))
  const ingData  = porMes.value.map(m => m.ingresos)
  const egData   = porMes.value.map(m => m.egresos)

  barChart = new Chart(barChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Ingresos', data: ingData, backgroundColor: 'rgba(87,255,184,0.65)', borderColor: '#57ffb8', borderWidth: 1, borderRadius: 6 },
        { label: 'Egresos',  data: egData,  backgroundColor: 'rgba(255,77,109,0.65)', borderColor: '#ff4d6d', borderWidth: 1, borderRadius: 6 },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#9090b0', font: { family: 'Syne', size: 11 } } },
        tooltip: {
          backgroundColor: '#12121f', borderColor: '#ffffff18', borderWidth: 1,
          titleColor: '#f0f0f8', bodyColor: '#9090b0',
          titleFont: { family: 'Syne' }, bodyFont: { family: 'Syne' },
          callbacks: { label: ctx => ` ${fmt(ctx.raw)}` },
        },
      },
      scales: {
        x: { ticks: { color: '#50506a', font: { family: 'Syne', size: 11 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
        y: {
          ticks: { color: '#50506a', font: { family: 'Syne', size: 10 }, callback: v => '$' + v.toLocaleString() },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
      },
    },
  })
}

function renderDoughnut() {
  if (doughnut) doughnut.destroy()
  const egresos = txStore.transactions.filter(t => t.tipo === 'egreso')
  const bycat = {}
  egresos.forEach(t => { bycat[t.categoria] = (bycat[t.categoria] || 0) + t.monto })
  const entries = Object.entries(bycat).sort((a, b) => b[1] - a[1])
  if (!entries.length) return

  doughnut = new Chart(doughnutRef.value, {
    type: 'doughnut',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{
        data: entries.map(e => e[1]),
        backgroundColor: entries.map(([cat]) => CAT_COLORS[cat] || '#888'),
        borderWidth: 0, hoverOffset: 6,
      }],
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#9090b0', font: { family: 'Syne', size: 11 }, padding: 14 } },
        tooltip: {
          backgroundColor: '#12121f', borderColor: '#ffffff18', borderWidth: 1,
          titleColor: '#f0f0f8', bodyColor: '#9090b0',
          titleFont: { family: 'Syne' }, bodyFont: { family: 'Syne' },
          callbacks: { label: ctx => ` ${fmt(ctx.raw)}` },
        },
      },
    },
  })
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    txStore.fetchResumen(anio),
    txStore.fetchTransactions(mes, anio),
  ])
  loading.value = false
  await nextTick()
  renderBarChart()
  renderDoughnut()
})
</script>