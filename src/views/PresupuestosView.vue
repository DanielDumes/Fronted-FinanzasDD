<!-- src/views/PresupuestosView.vue -->
<template>
  <div class="page active">
    <div class="container">

      <div class="page-title">Presupuestos</div>
      <div class="page-sub">Controla cuánto gastas por categoría cada mes</div>

      <div v-if="alertMsg" class="alert error show">{{ alertMsg }}</div>

      <!-- Month nav -->
      <div class="month-nav">
        <button @click="prevMonth">←</button>
        <span class="month-nav-label">{{ monthLabel }}</span>
        <button @click="nextMonth">→</button>
      </div>

      <!-- Stats -->
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr)">
        <div class="stat-card accent">
          <div class="stat-label">Total presupuestado</div>
          <div class="stat-value">{{ fmt(totalPresupuestado) }}</div>
        </div>
        <div class="stat-card red">
          <div class="stat-label">Total gastado</div>
          <div class="stat-value">{{ fmt(totalGastado) }}</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">Disponible</div>
          <div class="stat-value">{{ fmt(totalDisponible) }}</div>
        </div>
        <div class="stat-card" :class="excedidos > 0 ? 'red' : 'green'">
          <div class="stat-label">Categorías excedidas</div>
          <div class="stat-value">{{ excedidos }}</div>
        </div>
      </div>

      <div class="dash-grid">

        <!-- Lista de presupuestos -->
        <div>
          <div v-if="budgetStore.loading" class="panel">
            <div class="empty-state"><span class="loader"></span> Cargando...</div>
          </div>

          <div v-else-if="budgetStore.budgets.length === 0" class="panel">
            <div class="empty-state">
              <span class="icon">💰</span>
              No hay presupuestos para este mes. ¡Crea uno!
            </div>
          </div>

          <div v-else class="panel">
            <div class="panel-header">
              <span>Presupuestos del mes</span>
              <span>{{ budgetStore.budgets.length }} categorías</span>
            </div>
            <div
              v-for="b in budgetStore.budgets"
              :key="b._id"
              class="budget-item"
              :class="{ excedido: b.excedido }"
            >
              <div class="budget-top">
                <div class="budget-cat">
                  <span class="budget-icon">{{ getCatIcon(b.categoria) }}</span>
                  <span class="budget-nombre">{{ b.categoria }}</span>
                  <span v-if="b.excedido" class="badge-excedido">⚠ Excedido</span>
                </div>
                <div class="budget-nums">
                  <span class="budget-gastado" :style="{ color: b.excedido ? 'var(--red)' : 'var(--text)' }">
                    {{ fmt(b.gastado) }}
                  </span>
                  <span class="budget-total">/ {{ fmt(b.monto) }}</span>
                  <button class="tx-del" @click="handleDelete(b._id)">×</button>
                </div>
              </div>

              <div class="budget-bar-wrap">
                <div
                  class="budget-bar"
                  :style="{
                    width: b.porcentaje + '%',
                    background: b.excedido ? 'var(--red)' : b.porcentaje > 80 ? 'var(--gold)' : 'var(--accent)'
                  }"
                ></div>
              </div>

              <div class="budget-bottom">
                <span class="budget-pct">{{ b.porcentaje }}% usado</span>
                <span class="budget-disponible" :style="{ color: b.excedido ? 'var(--red)' : 'var(--green)' }">
                  {{ b.excedido ? 'Excedido en ' + fmt(b.gastado - b.monto) : fmt(b.disponible) + ' disponible' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario nuevo presupuesto -->
        <div class="panel">
          <div class="panel-header">Nuevo presupuesto</div>
          <div class="form-body">

            <div class="form-row">
              <label>Categoría de egreso</label>
              <select v-model="categoria">
                <option v-for="cat in CATEGORIAS_EGRESO" :key="cat.name" :value="cat.name">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="form-row">
              <label>Límite mensual ($)</label>
              <input v-model="monto" type="number" placeholder="0.00" min="0" step="0.01" />
            </div>

            <!-- Preview -->
            <div v-if="presupuestoExistente" class="preview-box">
              <span>⚠ Ya tienes un presupuesto para {{ categoria }} este mes.</span>
              <br>
              <span style="color:var(--text2)">Se actualizará al guardar.</span>
            </div>

            <button class="btn-add" @click="handleCreate" :disabled="saving">
              <span v-if="saving" class="loader"></span>
              {{ saving ? '...' : presupuestoExistente ? 'Actualizar presupuesto' : '+ Crear presupuesto' }}
            </button>

            <!-- Lista de categorías sin presupuesto -->
            <div v-if="sinPresupuesto.length > 0" style="margin-top:24px">
              <div style="font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);margin-bottom:12px">
                Sin presupuesto aún
              </div>
              <div
                v-for="cat in sinPresupuesto"
                :key="cat.name"
                class="cat-sugerida"
                @click="categoria = cat.name"
              >
                <span>{{ cat.icon }}</span>
                <span>{{ cat.name }}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useBudgetStore } from '../stores/budgets'

const budgetStore = useBudgetStore()
const CATEGORIAS_EGRESO = [
  { name: 'Comida',          icon: '🍔' },
  { name: 'Transporte',      icon: '🚗' },
  { name: 'Servicios',       icon: '💡' },
  { name: 'Salud',           icon: '🏥' },
  { name: 'Entretenimiento', icon: '🎬' },
  { name: 'Ropa',            icon: '👕' },
  { name: 'Educación',       icon: '📚' },
  { name: 'Otro',            icon: '📌' },
]

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const viewDate  = ref(new Date())
const categoria = ref('Comida')
const monto     = ref('')
const saving    = ref(false)
const alertMsg  = ref('')

const mes  = computed(() => viewDate.value.getMonth() + 1)
const anio = computed(() => viewDate.value.getFullYear())
const monthLabel = computed(() => `${MONTHS[viewDate.value.getMonth()]} ${viewDate.value.getFullYear()}`)

const totalPresupuestado = computed(() => budgetStore.budgets.reduce((s, b) => s + b.monto, 0))
const totalGastado       = computed(() => budgetStore.budgets.reduce((s, b) => s + b.gastado, 0))
const totalDisponible    = computed(() => budgetStore.budgets.reduce((s, b) => s + b.disponible, 0))
const excedidos          = computed(() => budgetStore.budgets.filter(b => b.excedido).length)

const presupuestoExistente = computed(() =>
  budgetStore.budgets.find(b => b.categoria === categoria.value)
)

const sinPresupuesto = computed(() =>
  CATEGORIAS_EGRESO.filter(c =>
    !budgetStore.budgets.find(b => b.categoria === c.name)
  )
)

function getCatIcon(name) {
  return CATEGORIAS_EGRESO.find(c => c.name === name)?.icon || '📌'
}

function fmt(n) {
  return '$' + Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function prevMonth() {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() - 1)
  viewDate.value = d
}

function nextMonth() {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() + 1)
  viewDate.value = d
}

async function handleCreate() {
  if (!monto.value || parseFloat(monto.value) <= 0) {
    alertMsg.value = 'Ingresa un monto válido'
    setTimeout(() => alertMsg.value = '', 3000)
    return
  }
  saving.value = true
  try {
    await budgetStore.createBudget({
      categoria: categoria.value,
      monto:     parseFloat(monto.value),
      mes:       mes.value,
      anio:      anio.value,
    })
    monto.value = ''
  } catch (err) {
    alertMsg.value = err.message
    setTimeout(() => alertMsg.value = '', 3000)
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('¿Eliminar este presupuesto?')) return
  try {
    await budgetStore.deleteBudget(id)
  } catch (err) {
    alertMsg.value = err.message
  }
}

async function loadData() {
  await budgetStore.fetchBudgets(mes.value, anio.value)
}

watch([mes, anio], loadData)
onMounted(loadData)
</script>

<style scoped>
.budget-item {
  padding: 18px 28px;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.budget-item:last-child { border-bottom: none; }
.budget-item:hover { background: var(--bg2); }
.budget-item.excedido { background: rgba(255,107,107,0.03); }

.budget-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.budget-cat { display: flex; align-items: center; gap: 10px; }
.budget-icon { font-size: 18px; }
.budget-nombre { font-size: 13px; font-weight: 500; }

.badge-excedido {
  font-size: 10px; font-weight: 600;
  color: var(--red);
  background: rgba(255,107,107,0.1);
  border: 1px solid rgba(255,107,107,0.2);
  padding: 3px 8px; border-radius: 20px;
}

.budget-nums { display: flex; align-items: center; gap: 6px; }
.budget-gastado { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.budget-total { font-size: 12px; color: var(--text3); font-variant-numeric: tabular-nums; }

.budget-bar-wrap { height: 5px; background: var(--surface3); border-radius: 3px; overflow: hidden; margin-bottom: 8px; }
.budget-bar { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1); }

.budget-bottom { display: flex; justify-content: space-between; }
.budget-pct { font-size: 11px; color: var(--text3); }
.budget-disponible { font-size: 11px; font-weight: 500; }

.preview-box {
  background: rgba(255,209,102,0.06);
  border: 1px solid rgba(255,209,102,0.2);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: var(--gold);
  margin-bottom: 14px;
}

.cat-sugerida {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text2);
  transition: all 0.15s;
  border: 1px solid transparent;
}
.cat-sugerida:hover {
  background: var(--surface2);
  border-color: var(--border2);
  color: var(--text);
}
</style>