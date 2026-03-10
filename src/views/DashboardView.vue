<!-- src/views/DashboardView.vue -->
<template>
  <div class="page active">
    <div class="container">

      <div class="page-title">Dashboard</div>
      <div class="page-sub">Resumen de tus finanzas personales</div>

      <div v-if="alertMsg" class="alert error show">{{ alertMsg }}</div>

      <!-- Month nav -->
      <div class="month-nav">
        <button @click="prevMonth">←</button>
        <span class="month-nav-label">{{ monthLabel }}</span>
        <button @click="nextMonth">→</button>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card green">
          <div class="stat-label">Ingresos del mes</div>
          <div class="stat-value">{{ fmt(txStore.totalIngresos) }}</div>
          <div class="stat-sub">{{ ingresos.length }} transacciones</div>
        </div>
        <div class="stat-card red">
          <div class="stat-label">Egresos del mes</div>
          <div class="stat-value">{{ fmt(txStore.totalEgresos) }}</div>
          <div class="stat-sub">{{ egresos.length }} transacciones</div>
        </div>
        <div class="stat-card accent">
          <div class="stat-label">Balance del mes</div>
          <div class="stat-value" :style="{ color: txStore.balance >= 0 ? 'var(--accent)' : 'var(--red)' }">
            {{ fmt(Math.abs(txStore.balance)) }}
          </div>
          <div class="stat-sub">{{ txStore.balance >= 0 ? '▲ superávit' : '▼ déficit' }}</div>
        </div>
      </div>

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

      <!-- Main grid -->
      <div class="dash-grid">

        <!-- Left: categories -->
        <div class="panel">
          <div class="panel-header">Distribución por categoría</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--border)">
            <div style="padding:16px 24px;border-right:1px solid var(--border)">
              <div style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--green);margin-bottom:10px;font-weight:600">Ingresos</div>
              <div v-if="catIngresos.length === 0" style="color:var(--text3);font-size:12px">Sin datos</div>
              <div v-for="cat in catIngresos" :key="cat.name" class="cat-item">
                <div class="cat-dot" :style="{ background: cat.color }"></div>
                <div class="cat-name">{{ cat.name }}</div>
                <div class="cat-bar-wrap"><div class="cat-bar" :style="{ width: cat.pct + '%', background: cat.color }"></div></div>
                <div class="cat-amount ingreso">{{ fmt(cat.amount) }}</div>
              </div>
            </div>
            <div style="padding:16px 24px">
              <div style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--red);margin-bottom:10px;font-weight:600">Egresos</div>
              <div v-if="catEgresos.length === 0" style="color:var(--text3);font-size:12px">Sin datos</div>
              <div v-for="cat in catEgresos" :key="cat.name" class="cat-item">
                <div class="cat-dot" :style="{ background: cat.color }"></div>
                <div class="cat-name">{{ cat.name }}</div>
                <div class="cat-bar-wrap"><div class="cat-bar" :style="{ width: cat.pct + '%', background: cat.color }"></div></div>
                <div class="cat-amount egreso">{{ fmt(cat.amount) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: form + list -->
        <div style="display:flex;flex-direction:column;gap:20px">

          <!-- Form -->
          <div class="panel">
            <div class="panel-header">Nueva transacción</div>
            <div class="form-body">
              <div class="type-toggle">
                <button :class="['type-btn', tipo === 'ingreso' ? 'active ingreso' : '']" @click="setTipo('ingreso')">↑ Ingreso</button>
                <button :class="['type-btn', tipo === 'egreso'  ? 'active egreso'  : '']" @click="setTipo('egreso')">↓ Egreso</button>
              </div>
              <div class="form-row">
                <label>Descripción</label>
                <input v-model="desc" type="text" placeholder="Ej: Sueldo, Supermercado..." />
              </div>
              <div class="form-row-2">
                <div class="form-row" style="margin-bottom:0">
                  <label>Monto ($)</label>
                  <input v-model="monto" type="number" placeholder="0.00" min="0" step="0.01" />
                </div>
                <div class="form-row" style="margin-bottom:0">
                  <label>Día</label>
                  <input v-model="dia" type="number" placeholder="1–31" min="1" max="31" />
                </div>
              </div>
              <div class="form-row" style="margin-top:14px">
                <label>Categoría</label>
                <select v-model="categoria">
                  <option v-for="cat in CATEGORIES[tipo]" :key="cat.name" :value="cat.name">
                    {{ cat.icon }} {{ cat.name }}
                  </option>
                </select>
              </div>
              <button class="btn-add" @click="handleAdd" :disabled="saving">
                <span v-if="saving" class="loader"></span>
                {{ saving ? '...' : '+ Agregar' }}
              </button>
            </div>
          </div>

         <!-- Buscador y filtros -->
<div class="panel" style="margin-bottom:0;border-bottom-left-radius:0;border-bottom-right-radius:0;border-bottom:none">
  <div style="padding:14px 28px;display:flex;gap:10px;align-items:center">
    <input
      v-model="busqueda"
      type="text"
      placeholder="🔍 Buscar transacción..."
      style="flex:1;background:var(--bg2);border:1px solid var(--border2);border-radius:8px;padding:9px 13px;color:var(--text);font-size:13px;outline:none;font-family:'Plus Jakarta Sans',sans-serif"
    />
    <select
      v-model="filtroTipo"
      style="background:var(--bg2);border:1px solid var(--border2);border-radius:8px;padding:9px 13px;color:var(--text);font-size:13px;outline:none;font-family:'Plus Jakarta Sans',sans-serif"
    >
      <option value="todos">Todos</option>
      <option value="ingreso">Ingresos</option>
      <option value="egreso">Egresos</option>
    </select>
  </div>
</div>

<!-- Transaction list -->
<div class="panel" style="border-top-left-radius:0;border-top-right-radius:0">
            <div class="panel-header">
              <span>Transacciones del mes</span>
              <span style="font-size:11px">{{ txStore.transactions.length }} total</span>
            </div>
            <div class="tx-list">
              <div v-if="txStore.loading" class="empty-state">
                <span class="loader"></span> Cargando...
              </div>
              <div v-else-if="txStore.transactions.length === 0" class="empty-state">
                <div class="icon">📭</div>
                Sin transacciones este mes
              </div>
              <div
                v-else
                v-for="t in sortedTxs"
                :key="t._id"
                class="tx-item"
              >
                <div :class="['tx-icon', t.tipo]">{{ getCatIcon(t.tipo, t.categoria) }}</div>
                <div class="tx-info">
                  <div class="tx-desc">{{ t.descripcion }}</div>
                  <div class="tx-meta">Día {{ getDay(t.fecha) }} · {{ t.categoria }}</div>
                </div>
                <div :class="['tx-amount', t.tipo]">
                  {{ t.tipo === 'ingreso' ? '+' : '-' }}{{ fmt(t.monto) }}
                </div>
                <button class="tx-edit" @click="abrirEditar(t)">✎</button>
                <button class="tx-del" @click="handleDelete(t._id)">×</button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- Modal editar -->
<div v-if="editando_modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px">
  <div style="background:var(--surface);border:1px solid var(--border2);border-radius:20px;padding:32px;width:100%;max-width:420px;box-shadow:var(--shadow)">
    <div style="font-size:16px;font-weight:600;margin-bottom:20px">Editar transacción</div>

    <div class="type-toggle" style="margin-bottom:16px">
      <button :class="['type-btn', editTipo === 'ingreso' ? 'active ingreso' : '']" @click="editTipo = 'ingreso'; editCategoria = CATEGORIES['ingreso'][0].name">↑ Ingreso</button>
      <button :class="['type-btn', editTipo === 'egreso'  ? 'active egreso'  : '']" @click="editTipo = 'egreso';  editCategoria = CATEGORIES['egreso'][0].name">↓ Egreso</button>
    </div>

    <div class="form-row">
      <label>Descripción</label>
      <input v-model="editDesc" type="text" placeholder="Descripción..." />
    </div>
    <div class="form-row-2" style="margin-bottom:16px">
      <div class="form-row" style="margin-bottom:0">
        <label>Monto ($)</label>
        <input v-model="editMonto" type="number" placeholder="0.00" />
      </div>
      <div class="form-row" style="margin-bottom:0">
        <label>Día</label>
        <input v-model="editDia" type="number" placeholder="1-31" />
      </div>
    </div>
    <div class="form-row">
      <label>Categoría</label>
      <select v-model="editCategoria">
        <option v-for="cat in CATEGORIES[editTipo]" :key="cat.name" :value="cat.name">
          {{ cat.icon }} {{ cat.name }}
        </option>
      </select>
    </div>

    <div style="display:flex;gap:10px;margin-top:4px">
      <button class="btn-add" style="flex:1" @click="handleEditar" :disabled="saving === 'edit'">
        <span v-if="saving === 'edit'" class="loader"></span>
        {{ saving === 'edit' ? '...' : 'Guardar cambios' }}
      </button>
      <button @click="editando_modal = false" style="padding:12px 18px;border-radius:10px;border:1px solid var(--border2);background:transparent;color:var(--text2);font-size:13px;cursor:pointer">
        Cancelar
      </button>
    </div>
  </div>
</div>


  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTransactionStore } from '../stores/transactions'

const txStore = useTransactionStore()

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const CATEGORIES = {
  ingreso: [
    { name: 'Sueldo',      icon: '💼', color: '#57ffb8' },
    { name: 'Freelance',   icon: '💻', color: '#44d4f5' },
    { name: 'Inversiones', icon: '📈', color: '#f5c844' },
    { name: 'Negocio',     icon: '🏪', color: '#a0f544' },
    { name: 'Otro',        icon: '➕', color: '#8888ff' },
  ],
  egreso: [
    { name: 'Comida',          icon: '🍔', color: '#ff4d6d' },
    { name: 'Transporte',      icon: '🚗', color: '#f58844' },
    { name: 'Servicios',       icon: '💡', color: '#f5c844' },
    { name: 'Salud',           icon: '🏥', color: '#f544b0' },
    { name: 'Entretenimiento', icon: '🎬', color: '#9944f5' },
    { name: 'Ropa',            icon: '👕', color: '#44a0f5' },
    { name: 'Educación',       icon: '📚', color: '#44f5d4' },
    { name: 'Otro',            icon: '📌', color: '#888888' },
  ],
}

const viewDate  = ref(new Date())
const tipo      = ref('ingreso')
const desc      = ref('')
const monto     = ref('')
const dia       = ref('')
const categoria = ref('Sueldo')
const saving    = ref(false)
const alertMsg  = ref('')
const editando      = ref(null)  // transacción que se está editando
const editDesc      = ref('')
const editMonto     = ref('')
const editDia       = ref('')
const editCategoria = ref('')
const editTipo      = ref('ingreso')
const editando_modal = ref(false)
const busqueda = ref('')
const filtroTipo = ref ('todos')

const monthLabel = computed(() =>
  `${MONTHS[viewDate.value.getMonth()]} ${viewDate.value.getFullYear()}`
)

const mes  = computed(() => viewDate.value.getMonth() + 1)
const anio = computed(() => viewDate.value.getFullYear())

const ingresos = computed(() => txStore.transactions.filter(t => t.tipo === 'ingreso'))
const egresos  = computed(() => txStore.transactions.filter(t => t.tipo === 'egreso'))

const sortedTxs = computed(() => {
  let txs = [...txStore.transactions]

  if (filtroTipo.value !== 'todos') {
    txs = txs.filter(t => t.tipo === filtroTipo.value)
  }

  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    txs = txs.filter(t =>
      t.descripcion.toLowerCase().includes(q) ||
      t.categoria.toLowerCase().includes(q)
    )
  }

  return txs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const balanceAcumulado = computed(() => txStore.resumen?.balanceAcumulado || 0)

const catIngresos = computed(() => buildCats(ingresos.value, txStore.totalIngresos, 'ingreso'))
const catEgresos  = computed(() => buildCats(egresos.value,  txStore.totalEgresos,  'egreso'))

function abrirEditar(t) {
  editando.value      = t
  editDesc.value      = t.descripcion
  editMonto.value     = t.monto
  editDia.value       = new Date(t.fecha).getUTCDate()
  editCategoria.value = t.categoria
  editTipo.value      = t.tipo
  editando_modal.value = true
}

async function handleEditar() {
  if (!editDesc.value || !editMonto.value) return
  saving.value = 'edit'
  try {
    const fecha = new Date(anio.value, mes.value - 1, parseInt(editDia.value))
    await txStore.updateTransaction(editando.value._id, {
      tipo:        editTipo.value,
      descripcion: editDesc.value,
      monto:       parseFloat(editMonto.value),
      categoria:   editCategoria.value,
      fecha,
    })
    editando_modal.value = false
    await txStore.fetchResumen(anio.value)
  } catch (err) {
    alertMsg.value = err.message
    setTimeout(() => alertMsg.value = '', 3000)
  } finally {
    saving.value = null
  }
}

function buildCats(txs, total, tipo) {
  const bycat = {}
  txs.forEach(t => { bycat[t.categoria] = (bycat[t.categoria] || 0) + t.monto })
  return Object.entries(bycat)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => {
      const info = CATEGORIES[tipo].find(c => c.name === name) || { color: '#888' }
      return { name, amount, color: info.color, pct: total > 0 ? (amount / total * 100) : 0 }
    })
}

function setTipo(t) {
  tipo.value = t
  categoria.value = CATEGORIES[t][0].name
}

function getCatIcon(tipo, name) {
  return (CATEGORIES[tipo] || []).find(c => c.name === name)?.icon || '•'
}

function getDay(fecha) {
  return new Date(fecha).getUTCDate()
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

async function loadData() {
  await Promise.all([
    txStore.fetchTransactions(mes.value, anio.value),
    txStore.fetchResumen(anio.value),
  ])
}

async function handleAdd() {
  if (!desc.value || !monto.value) {
    alertMsg.value = 'Completa descripción y monto'
    setTimeout(() => alertMsg.value = '', 3000)
    return
  }
  saving.value = true
  try {
    const d = parseInt(dia.value) || new Date().getDate()
    const fecha = new Date(anio.value, mes.value - 1, d)
    await txStore.createTransaction({
      tipo: tipo.value,
      descripcion: desc.value,
      monto: parseFloat(monto.value),
      categoria: categoria.value,
      fecha,
    })
    desc.value = ''
    monto.value = ''
    dia.value = ''
    await txStore.fetchResumen(anio.value)
  } catch (err) {
    alertMsg.value = err.message
    setTimeout(() => alertMsg.value = '', 3000)
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('¿Eliminar esta transacción?')) return
  try {
    await txStore.deleteTransaction(id)
    await txStore.fetchResumen(anio.value)
  } catch (err) {
    alertMsg.value = err.message
  }
}

watch([mes, anio], loadData)
onMounted(loadData)
</script>