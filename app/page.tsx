'use client'

import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_PLAYERS, Jornada, calcStats, ULTIMO_COST, PENULTIMO_COST } from '@/lib/data'
import styles from './page.module.css'

type Tab = 'jornadas' | 'ranking' | 'deudas'

const STORAGE_KEY = 'fantasy-liga-v1'

function loadState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export default function Home() {
  const [players] = useState(DEFAULT_PLAYERS)
  const [jornadas, setJornadas] = useState<Jornada[]>([])
  const [payments, setPayments] = useState<Record<string, number>>({})
  const [tab, setTab] = useState<Tab>('jornadas')
  const [showForm, setShowForm] = useState(false)
  const [editJornada, setEditJornada] = useState<Jornada | null>(null)
  const [payInput, setPayInput] = useState<Record<string, string>>({})
  const [toast, setToast] = useState('')

  useEffect(() => {
    const saved = loadState()
    if (saved) {
      if (saved.jornadas) setJornadas(saved.jornadas)
      if (saved.payments) setPayments(saved.payments)
    }
  }, [])

  const save = useCallback((j: Jornada[], p: Record<string, number>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ jornadas: j, payments: p }))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const addOrEditJornada = (data: Omit<Jornada, 'id'>) => {
    let updated: Jornada[]
    if (editJornada) {
      updated = jornadas.map(j => j.id === editJornada.id ? { ...data, id: editJornada.id } : j)
      showToast('Jornada actualizada ✓')
    } else {
      const nextId = jornadas.length > 0 ? Math.max(...jornadas.map(j => j.id)) + 1 : 1
      updated = [...jornadas, { ...data, id: nextId }]
      showToast(`Jornada ${nextId} guardada ✓`)
    }
    setJornadas(updated)
    save(updated, payments)
    setShowForm(false)
    setEditJornada(null)
  }

  const deleteJornada = (id: number) => {
    const updated = jornadas.filter(j => j.id !== id)
    setJornadas(updated)
    save(updated, payments)
    showToast('Jornada eliminada')
  }

  const registerPayment = (name: string) => {
    const amount = parseFloat(payInput[name] || '0')
    if (isNaN(amount) || amount <= 0) return
    const updated = { ...payments, [name]: (payments[name] ?? 0) + amount }
    setPayments(updated)
    save(jornadas, updated)
    setPayInput(p => ({ ...p, [name]: '' }))
    showToast(`Pago de ${amount.toFixed(2)}€ registrado para ${name}`)
  }

  const resetPayment = (name: string) => {
    const updated = { ...payments, [name]: 0 }
    setPayments(updated)
    save(jornadas, updated)
    showToast(`Pagos de ${name} reiniciados`)
  }

  const stats = calcStats(players, jornadas, payments)
  const totalPendiente = stats.reduce((s, p) => s + p.owes, 0)

  const rankingByUltimos = [...stats].sort((a, b) => b.ultimos - a.ultimos || b.penultimos - a.penultimos)
  const rankingByPrimeros = [...stats].sort((a, b) => b.primeros - a.primeros)

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <p className={styles.headerSub}>FANTASY MANAGER</p>
            <h1 className={styles.headerTitle}>LA LIGA 💸</h1>
          </div>
          <div className={styles.headerBadge}>
            <span className={styles.badgeNum}>J{jornadas.length}</span>
            <span className={styles.badgeLabel}>jornadas</span>
          </div>
        </div>
        {totalPendiente > 0 && (
          <div className={styles.alertBanner}>
            <span>⚠️</span>
            <span>Pendiente de cobro: <strong>{totalPendiente.toFixed(2)}€</strong></span>
          </div>
        )}
      </header>

      {/* Tabs */}
      <nav className={styles.tabs}>
        {(['jornadas', 'ranking', 'deudas'] as Tab[]).map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'jornadas' ? '📅 Jornadas' : t === 'ranking' ? '🏆 Ranking' : '💰 Deudas'}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className={styles.content}>
        {tab === 'jornadas' && (
          <JornadasTab
            jornadas={jornadas}
            players={players}
            onAdd={() => { setEditJornada(null); setShowForm(true) }}
            onEdit={j => { setEditJornada(j); setShowForm(true) }}
            onDelete={deleteJornada}
          />
        )}
        {tab === 'ranking' && (
          <RankingTab rankingByUltimos={rankingByUltimos} rankingByPrimeros={rankingByPrimeros} />
        )}
        {tab === 'deudas' && (
          <DeudasTab
            stats={stats}
            payInput={payInput}
            setPayInput={setPayInput}
            onPay={registerPayment}
            onReset={resetPayment}
          />
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <JornadaForm
          players={players}
          jornadas={jornadas}
          edit={editJornada}
          onSave={addOrEditJornada}
          onClose={() => { setShowForm(false); setEditJornada(null) }}
        />
      )}

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}
    </main>
  )
}

/* ── JORNADAS TAB ── */
function JornadasTab({ jornadas, players, onAdd, onEdit, onDelete }: {
  jornadas: Jornada[]
  players: string[]
  onAdd: () => void
  onEdit: (j: Jornada) => void
  onDelete: (id: number) => void
}) {
  const sorted = [...jornadas].sort((a, b) => b.id - a.id)

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>JORNADAS</h2>
        <button className={styles.addBtn} onClick={onAdd}>+ NUEVA</button>
      </div>

      {sorted.length === 0 ? (
        <div className={styles.empty}>
          <p style={{ fontSize: 48 }}>⚽</p>
          <p>Sin jornadas todavía</p>
          <p style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>Pulsa "NUEVA" para empezar</p>
        </div>
      ) : (
        sorted.map(j => (
          <div key={j.id} className={styles.jornadaCard}>
            <div className={styles.jornadaNum}>
              <span className={styles.jornadaNumLabel}>J</span>
              <span className={styles.jornadaNumVal}>{j.id}</span>
            </div>
            <div className={styles.jornadaPlayers}>
              <div className={styles.jornadaRow}>
                <span className={styles.badge} data-type="ultimo">ÚLTIMO</span>
                <span className={styles.playerName}>{j.ultimo}</span>
                <span className={styles.cost}>{ULTIMO_COST.toFixed(2)}€</span>
              </div>
              <div className={styles.jornadaRow}>
                <span className={styles.badge} data-type="penultimo">PENÚLT.</span>
                <span className={styles.playerName}>{j.penultimo}</span>
                <span className={styles.cost}>{PENULTIMO_COST.toFixed(2)}€</span>
              </div>
              {j.primero && (
                <div className={styles.jornadaRow}>
                  <span className={styles.badge} data-type="primero">1º</span>
                  <span className={styles.playerName}>{j.primero}</span>
                  <span className={styles.cost} style={{ color: 'var(--gold)' }}>👑</span>
                </div>
              )}
            </div>
            <div className={styles.jornadaActions}>
              <button className={styles.iconBtn} onClick={() => onEdit(j)}>✏️</button>
              <button className={styles.iconBtn} onClick={() => {
                if (confirm(`¿Eliminar jornada ${j.id}?`)) onDelete(j.id)
              }}>🗑️</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

/* ── RANKING TAB ── */
function RankingTab({ rankingByUltimos, rankingByPrimeros }: {
  rankingByUltimos: ReturnType<typeof calcStats>
  rankingByPrimeros: ReturnType<typeof calcStats>
}) {
  const [view, setView] = useState<'malos' | 'buenos'>('malos')

  const list = view === 'malos' ? rankingByUltimos : rankingByPrimeros

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>RANKING</h2>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleBtn} ${view === 'malos' ? styles.toggleActive : ''}`}
            onClick={() => setView('malos')}
          >😬 Malos</button>
          <button
            className={`${styles.toggleBtn} ${view === 'buenos' ? styles.toggleActive : ''}`}
            onClick={() => setView('buenos')}
          >👑 Buenos</button>
        </div>
      </div>

      {list.map((p, i) => {
        const isFirst = i === 0
        const val = view === 'malos'
          ? `${p.ultimos}🔴 + ${p.penultimos}🟡`
          : `${p.primeros} primeros`
        const debt = view === 'malos' ? p.totalDebt : null

        return (
          <div key={p.name} className={`${styles.rankCard} ${isFirst && view === 'malos' ? styles.rankFirst : ''} ${isFirst && view === 'buenos' ? styles.rankBest : ''}`}>
            <span className={styles.rankPos}>
              {i === 0 ? (view === 'malos' ? '💀' : '👑') : `#${i + 1}`}
            </span>
            <div className={styles.rankInfo}>
              <span className={styles.rankName}>{p.name}</span>
              <span className={styles.rankSub}>{val}</span>
            </div>
            {debt !== null && (
              <span className={styles.rankDebt}>{debt.toFixed(2)}€</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── DEUDAS TAB ── */
function DeudasTab({ stats, payInput, setPayInput, onPay, onReset }: {
  stats: ReturnType<typeof calcStats>
  payInput: Record<string, string>
  setPayInput: (fn: (p: Record<string, string>) => Record<string, string>) => void
  onPay: (name: string) => void
  onReset: (name: string) => void
}) {
  const sorted = [...stats].sort((a, b) => b.owes - a.owes)

  const totalDebt = stats.reduce((s, p) => s + p.totalDebt, 0)
  const totalPaid = stats.reduce((s, p) => s + p.paid, 0)
  const totalOwes = stats.reduce((s, p) => s + p.owes, 0)

  return (
    <div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>TOTAL GENERADO</span>
          <span className={styles.summaryVal}>{totalDebt.toFixed(2)}€</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>COBRADO</span>
          <span className={styles.summaryVal} style={{ color: '#4ade80' }}>{totalPaid.toFixed(2)}€</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>PENDIENTE</span>
          <span className={styles.summaryVal} style={{ color: 'var(--red)' }}>{totalOwes.toFixed(2)}€</span>
        </div>
      </div>

      <h2 className={styles.sectionTitle} style={{ marginBottom: 12 }}>JUGADORES</h2>

      {sorted.map(p => (
        <div key={p.name} className={`${styles.deudaCard} ${p.owes > 0 ? styles.deudaPending : styles.deudaClear}`}>
          <div className={styles.deudaTop}>
            <div>
              <span className={styles.deudaName}>{p.name}</span>
              <span className={styles.deudaSub}>
                {p.ultimos}🔴 {p.penultimos}🟡 — Total: {p.totalDebt.toFixed(2)}€
              </span>
            </div>
            <div className={styles.deudaStatus}>
              {p.owes === 0
                ? <span className={styles.paidBadge}>✓ PAGADO</span>
                : <span className={styles.owesBadge}>Debe {p.owes.toFixed(2)}€</span>
              }
            </div>
          </div>

          {p.owes > 0 && (
            <div className={styles.payRow}>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="€ a pagar"
                value={payInput[p.name] ?? ''}
                onChange={e => setPayInput(prev => ({ ...prev, [p.name]: e.target.value }))}
                className={styles.payInput}
              />
              <button className={styles.payBtn} onClick={() => onPay(p.name)}>COBRAR</button>
              <button className={styles.resetBtn} onClick={() => {
                if (confirm(`¿Reiniciar pagos de ${p.name}?`)) onReset(p.name)
              }}>↺</button>
            </div>
          )}

          {p.paid > 0 && p.owes === 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button className={styles.resetBtnSmall} onClick={() => {
                if (confirm(`¿Reiniciar pagos de ${p.name}?`)) onReset(p.name)
              }}>↺ reiniciar</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── FORM MODAL ── */
function JornadaForm({ players, jornadas, edit, onSave, onClose }: {
  players: string[]
  jornadas: Jornada[]
  edit: Jornada | null
  onSave: (data: Omit<Jornada, 'id'>) => void
  onClose: () => void
}) {
  const nextId = jornadas.length > 0 ? Math.max(...jornadas.map(j => j.id)) + 1 : 1
  const displayId = edit ? edit.id : nextId

  const [ultimo, setUltimo] = useState(edit?.ultimo ?? '')
  const [penultimo, setPenultimo] = useState(edit?.penultimo ?? '')
  const [primero, setPrimero] = useState(edit?.primero ?? '')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!ultimo || !penultimo) { setError('Selecciona último y penúltimo'); return }
    if (ultimo === penultimo) { setError('No pueden ser el mismo jugador'); return }
    onSave({ ultimo, penultimo, primero: primero || undefined })
  }

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{edit ? `EDITAR J${edit.id}` : `JORNADA ${displayId}`}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>🔴 ÚLTIMO (paga {ULTIMO_COST}€)</label>
          <select value={ultimo} onChange={e => setUltimo(e.target.value)} className={styles.select}>
            <option value="">— Seleccionar —</option>
            {players.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>🟡 PENÚLTIMO (paga {PENULTIMO_COST}€)</label>
          <select value={penultimo} onChange={e => setPenultimo(e.target.value)} className={styles.select}>
            <option value="">— Seleccionar —</option>
            {players.filter(p => p !== ultimo).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>👑 PRIMERO (opcional)</label>
          <select value={primero} onChange={e => setPrimero(e.target.value)} className={styles.select}>
            <option value="">— Opcional —</option>
            {players.filter(p => p !== ultimo && p !== penultimo).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.saveBtn} onClick={handleSave}>
          {edit ? 'ACTUALIZAR' : 'GUARDAR JORNADA'}
        </button>
      </div>
    </div>
  )
}
