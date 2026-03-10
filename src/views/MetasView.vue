<!-- src/views/MetasView.vue -->
<template>
  <div class="page active">
    <div class="container">

      <div class="page-title">Metas de Ahorro</div>
      <div class="page-sub">Registra y sigue el progreso de tus objetivos financieros</div>

      <div v-if="alertMsg" class="alert error show">{{ alertMsg }}</div>

      <!-- Stats -->
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr)">
        <div class="stat-card accent">
          <div class="stat-label">Total metas</div>
          <div class="stat-value">{{ goalStore.goals.length }}</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">Completadas</div>
          <div class="stat-value">{{ completadas }}</div>
        </div>
        <div class="stat-card accent">
          <div class="stat-label">En progreso</div>
          <div class="stat-value">{{ enProgreso }}</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">Total ahorrado</div>
          <div class="stat-value">{{ fmt(totalAhorrado) }}</div>
        </div>
      </div>

      <div class="dash-grid">

        <!-- Lista de metas -->
        <div>
          <div v-if="goalStore.loading" class="panel">
            <div class="empty-state"><span class="loader"></span> Cargando...</div>
          </div>

          <div v-else-if="goalStore.goals.length === 0" class="panel">
            <div class="empty-state">
              <span class="icon">🎯</span>
              No tienes metas aún. ¡Crea tu primera meta!
            </div>
          </div>

          <div v-else>
            <div
              v-for="goal in goalStore.goals"
              :key="goal._id"
              class="panel goal-card"
              :class="{ completada: goal.completada }"
            >
              <div class="goal-header">
                <div class="goal-icon">{{ goal.icono }}</div>
                <div class="goal-info">
                  <div class="goal-nombre">{{ goal.nombre }}</div>
                  <div class="goal-desc" v-if="goal.descripcion">{{ goal.descripcion }}</div>
                </div>
                <div class="goal-actions">
                  <span v-if="goal.completada" class="badge-completada">✓ Completada</span>
                  <button class="tx-del" @click="handleDelete(goal._id)">×</button>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="goal-progress-wrap">
                <div class="goal-progress-info">
                  <span class="goal-actual">{{ fmt(goal.montoActual) }}</span>
                  <span class="goal-objetivo">de {{ fmt(goal.montoObjetivo) }}</span>
                </div>
                <div class="goal-bar-wrap">
                  <div
                    class="goal-bar"
                    :style="{
                      width: Math.min((goal.montoActual / goal.montoObjetivo) * 100, 100) + '%',
                      background: goal.completada ? 'var(--green)' : 'var(--accent)'
                    }"
                  ></div>
                </div>
                <div class="goal-pct">{{ Math.round((goal.montoActual / goal.montoObjetivo) * 100) }}%</div>
              </div>

              <!-- Fecha límite -->
              <div v-if="goal.fechaLimite" class="goal-fecha">
                📅 Límite: {{ formatFecha(goal.fechaLimite) }}
                <span :style="{ color: diasRestantes(goal.fechaLimite) < 30 ? 'var(--red)' : 'var(--text3)' }">
                  ({{ diasRestantes(goal.fechaLimite) }} días restantes)
                </span>
              </div>

              <!-- Abonar -->
              <div v-if="!goal.completada" class="goal-abonar">
                <input
                  v-model="abonos[goal._id]"
                  type="number"
                  placeholder="Monto a abonar..."
                  class="abonar-input"
                  min="0"
                  step="0.01"
                />
                <button class="abonar-btn" @click="handleAbonar(goal._id)" :disabled="saving === goal._id">
                  <span v-if="saving === goal._id" class="loader"></span>
                  {{ saving === goal._id ? '...' : '+ Abonar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario nueva meta -->
        <div class="panel">
          <div class="panel-header">Nueva meta</div>
          <div class="form-body">

            <!-- Selector de icono -->
            <div class="form-row">
              <label>Icono</label>
              <div class="icon-grid">
                <button
                  v-for="ic in ICONOS"
                  :key="ic"
                  :class="['icon-btn', icono === ic ? 'active' : '']"
                  @click="icono = ic"
                >{{ ic }}</button>
              </div>
            </div>

            <div class="form-row">
              <label>Nombre de la meta</label>
              <input v-model="nombre" type="text" placeholder="Ej: Vacaciones, Auto nuevo..." />
            </div>

            <div class="form-row">
              <label>Descripción (opcional)</label>
              <input v-model="descripcion" type="text" placeholder="Breve descripción..." />
            </div>

            <div class="form-row">
              <label>Monto objetivo ($)</label>
              <input v-model="montoObjetivo" type="number" placeholder="0.00" min="0" step="0.01" />
            </div>

            <div class="form-row">
              <label>Monto inicial ($)</label>
              <input v-model="montoInicial" type="number" placeholder="0.00" min="0" step="0.01" />
            </div>

            <div class="form-row">
              <label>Fecha límite (opcional)</label>
              <input v-model="fechaLimite" type="date" />
            </div>

            <button class="btn-add" @click="handleCreate" :disabled="saving === 'new'">
              <span v-if="saving === 'new'" class="loader"></span>
              {{ saving === 'new' ? '...' : '+ Crear meta' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGoalStore } from '../stores/goals'

const goalStore = useGoalStore()

const ICONOS = ['🎯','🏠','🚗','✈️','💻','📱','🎓','💍','🏋️','🌴','💰','🏦','🛍️','🎸','⛵']

const nombre       = ref('')
const descripcion  = ref('')
const montoObjetivo = ref('')
const montoInicial  = ref('')
const fechaLimite  = ref('')
const icono        = ref('🎯')
const saving       = ref(null)
const alertMsg     = ref('')
const abonos       = ref({})

const completadas   = computed(() => goalStore.goals.filter(g => g.completada).length)
const enProgreso    = computed(() => goalStore.goals.filter(g => !g.completada).length)
const totalAhorrado = computed(() => goalStore.goals.reduce((s, g) => s + g.montoActual, 0))

function fmt(n) {
  return '$' + Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function diasRestantes(fecha) {
  const diff = new Date(fecha) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

async function handleCreate() {
  if (!nombre.value || !montoObjetivo.value) {
    alertMsg.value = 'Completa nombre y monto objetivo'
    setTimeout(() => alertMsg.value = '', 3000)
    return
  }
  saving.value = 'new'
  try {
    const goal = await goalStore.createGoal({
      nombre:        nombre.value,
      descripcion:   descripcion.value,
      montoObjetivo: parseFloat(montoObjetivo.value),
      fechaLimite:   fechaLimite.value || undefined,
      icono:         icono.value,
    })

    // Si hay monto inicial, abonarlo
    if (montoInicial.value && parseFloat(montoInicial.value) > 0) {
      await goalStore.abonarGoal(goal._id, parseFloat(montoInicial.value))
    }

    nombre.value = ''
    descripcion.value = ''
    montoObjetivo.value = ''
    montoInicial.value = ''
    fechaLimite.value = ''
    icono.value = '🎯'
  } catch (err) {
    alertMsg.value = err.message
    setTimeout(() => alertMsg.value = '', 3000)
  } finally {
    saving.value = null
  }
}

async function handleAbonar(id) {
  const monto = parseFloat(abonos.value[id])
  if (!monto || monto <= 0) return
  saving.value = id
  try {
    await goalStore.abonarGoal(id, monto)
    abonos.value[id] = ''
  } catch (err) {
    alertMsg.value = err.message
    setTimeout(() => alertMsg.value = '', 3000)
  } finally {
    saving.value = null
  }
}

async function handleDelete(id) {
  if (!confirm('¿Eliminar esta meta?')) return
  try {
    await goalStore.deleteGoal(id)
  } catch (err) {
    alertMsg.value = err.message
  }
}

onMounted(() => goalStore.fetchGoals())
</script>

<style scoped>
.goal-card { margin-bottom: 16px; padding: 24px 28px; }
.goal-card.completada { opacity: 0.7; }

.goal-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
.goal-icon { font-size: 28px; flex-shrink: 0; }
.goal-info { flex: 1; }
.goal-nombre { font-size: 16px; font-weight: 600; margin-bottom: 2px; }
.goal-desc { font-size: 12px; color: var(--text2); }
.goal-actions { display: flex; align-items: center; gap: 10px; }

.badge-completada {
  font-size: 11px; font-weight: 600;
  color: var(--green);
  background: rgba(86,255,178,0.1);
  border: 1px solid rgba(86,255,178,0.25);
  padding: 4px 10px; border-radius: 20px;
}

.goal-progress-wrap { margin-bottom: 14px; }
.goal-progress-info { display: flex; justify-content: space-between; margin-bottom: 8px; }
.goal-actual { font-size: 18px; font-weight: 600; font-family: 'Cormorant Garamond', serif; font-style: italic; color: var(--accent); }
.goal-objetivo { font-size: 12px; color: var(--text2); align-self: flex-end; }
.goal-bar-wrap { height: 6px; background: var(--surface3); border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
.goal-bar { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.goal-pct { font-size: 11px; color: var(--text3); text-align: right; }

.goal-fecha { font-size: 12px; color: var(--text3); margin-bottom: 16px; }

.goal-abonar { display: flex; gap: 10px; margin-top: 4px; }
.abonar-input {
  flex: 1;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--radius-sm);
  padding: 9px 13px;
  color: var(--text);
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.abonar-input:focus { border-color: rgba(168,255,120,0.35); box-shadow: 0 0 0 3px rgba(168,255,120,0.05); }
.abonar-btn {
  padding: 9px 18px;
  background: var(--accent);
  color: #060d09;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  transition: all 0.2s;
  white-space: nowrap;
}
.abonar-btn:hover { background: #bfffaa; transform: translateY(-1px); }
.abonar-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.icon-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.icon-btn {
  width: 36px; height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--bg2);
  font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.icon-btn:hover { border-color: var(--border3); background: var(--surface2); }
.icon-btn.active { border-color: rgba(168,255,120,0.4); background: rgba(168,255,120,0.08); }
</style>