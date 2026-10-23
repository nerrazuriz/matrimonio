import { useEffect, useState } from 'react'
import { Plus, X, Trash2, RotateCcw, Circle, Square } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Table, Guest } from '@/types/database'
import { cn } from '@/lib/cn'

// ─── Types ───────────────────────────────────────────────────────
type Shape = 'circle' | 'rect'

interface TableLayout {
  x: number; y: number
  size: number    // circle: diameter
  width: number   // rect: width
  height: number  // rect: height
  shape: Shape
}

type LayoutMap = Record<string, TableLayout>

// ─── Constants ───────────────────────────────────────────────────
const STORAGE_KEY = 'wedding_seating_layout'
const SD = 22   // seat diameter
const SG = 10   // seat gap from table edge

// ─── Layout persistence ──────────────────────────────────────────
function loadLayout(tables: Table[]): LayoutMap {
  let saved: LayoutMap = {}
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { /* */ }

  const result: LayoutMap = {}
  tables.forEach((t, i) => {
    result[t.id] = saved[t.id] ?? {
      x: 200 + (i % 5) * 220,
      y: 200 + Math.floor(i / 5) * 240,
      size: 130, width: 200, height: 130, shape: 'circle',
    }
  })
  return result
}

function saveLayout(layout: LayoutMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
}

// ─── Seat position math ──────────────────────────────────────────
function containerSize(l: TableLayout) {
  const tw = l.shape === 'circle' ? l.size : l.width
  const th = l.shape === 'circle' ? l.size : l.height
  return { w: tw + 2 * (SG + SD), h: th + 2 * (SG + SD) }
}

function getSeats(l: TableLayout, n: number): { x: number; y: number }[] {
  if (n === 0) return []
  const { w, h } = containerSize(l)
  const cx = w / 2, cy = h / 2

  if (l.shape === 'circle') {
    const orbitR = l.size / 2 + SG + SD / 2
    return Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2
      return { x: cx + orbitR * Math.cos(angle) - SD / 2, y: cy + orbitR * Math.sin(angle) - SD / 2 }
    })
  }

  // rect: distribute evenly around all 4 edges
  const perimeter = 2 * (l.width + l.height)
  return Array.from({ length: n }, (_, i) => {
    const dist = (i / n) * perimeter
    const hw = l.width / 2, hh = l.height / 2
    let sx: number, sy: number
    if (dist < l.width) {
      sx = cx - hw + dist; sy = cy - hh - SG - SD / 2
    } else if (dist < l.width + l.height) {
      sx = cx + hw + SG + SD / 2; sy = cy - hh + (dist - l.width)
    } else if (dist < 2 * l.width + l.height) {
      sx = cx + hw - (dist - l.width - l.height); sy = cy + hh + SG + SD / 2
    } else {
      sx = cx - hw - SG - SD / 2; sy = cy + hh - (dist - 2 * l.width - l.height)
    }
    return { x: sx - SD / 2, y: sy - SD / 2 }
  })
}

const SEAT_COLOR: Record<string, string> = {
  confirmed: '#22c55e',
  pending:   '#f59e0b',
  declined:  '#ef4444',
}

// ─── Component ───────────────────────────────────────────────────
export default function TablesPage() {
  const [tables, setTables]       = useState<Table[]>([])
  const [guests, setGuests]       = useState<Guest[]>([])
  const [layout, setLayout]       = useState<LayoutMap>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)
  const [addModal, setAddModal]   = useState(false)
  const [addForm, setAddForm]     = useState({ number: '', name: '', capacity: '8' })
  const [saving, setSaving]       = useState(false)
  const [guestSearch, setGuestSearch] = useState('')

  async function load() {
    const [{ data: t }, { data: g }] = await Promise.all([
      supabase.from('tables').select('*').order('number'),
      supabase.from('guests').select('*').order('full_name'),
    ])
    const tList = t ?? []
    setTables(tList)
    setGuests(g ?? [])
    setLayout(loadLayout(tList))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function patchLayout(id: string, patch: Partial<TableLayout>) {
    setLayout(prev => {
      const next: LayoutMap = { ...prev, [id]: { ...prev[id], ...patch } as TableLayout }
      saveLayout(next)
      return next
    })
  }

  // ─── Drag ────────────────────────────────────────────────────
  function startDrag(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    const x0 = e.clientX, y0 = e.clientY
    const ox = layout[id]!.x, oy = layout[id]!.y

    const move = (ev: MouseEvent) =>
      patchLayout(id, { x: Math.max(60, ox + ev.clientX - x0), y: Math.max(60, oy + ev.clientY - y0) })
    const up = () => { removeEventListener('mousemove', move); removeEventListener('mouseup', up) }
    addEventListener('mousemove', move)
    addEventListener('mouseup', up)
  }

  // ─── Resize (corner handle) ───────────────────────────────────
  function startResize(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    const x0 = e.clientX, y0 = e.clientY
    const orig = { ...layout[id]! }

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - x0, dy = ev.clientY - y0
      if (orig.shape === 'circle') {
        patchLayout(id, { size: Math.max(80, orig.size + (dx + dy) / 2) })
      } else {
        patchLayout(id, {
          width:  Math.max(100, orig.width  + dx),
          height: Math.max(80,  orig.height + dy),
        })
      }
    }
    const up = () => { removeEventListener('mousemove', move); removeEventListener('mouseup', up) }
    addEventListener('mousemove', move)
    addEventListener('mouseup', up)
  }

  // ─── Table / guest mutations ──────────────────────────────────
  async function updateTable(id: string, patch: Partial<Table>) {
    await supabase.from('tables').update(patch).eq('id', id)
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
  }

  async function deleteTable(id: string) {
    if (!confirm(`¿Eliminar esta mesa? Los invitados quedarán sin mesa.`)) return
    await supabase.from('tables').delete().eq('id', id)
    setSelectedId(null)
    setTables(prev => prev.filter(t => t.id !== id))
    setLayout(prev => { const n = { ...prev }; delete n[id]; saveLayout(n); return n })
  }

  async function assignGuest(guestId: string, tableId: string) {
    await supabase.from('guests').update({ table_id: tableId, updated_at: new Date().toISOString() }).eq('id', guestId)
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, table_id: tableId } : g))
  }

  async function unassignGuest(guestId: string) {
    await supabase.from('guests').update({ table_id: null, updated_at: new Date().toISOString() }).eq('id', guestId)
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, table_id: null } : g))
  }

  async function handleAddTable() {
    if (!addForm.number || !addForm.capacity) return
    setSaving(true)
    const { data } = await supabase
      .from('tables')
      .insert({ number: parseInt(addForm.number), name: addForm.name || null, capacity: parseInt(addForm.capacity) })
      .select().single()
    if (data) {
      setTables(prev => [...prev, data])
      setLayout(prev => {
        const next = { ...prev, [data.id]: { x: 300 + Math.random() * 500, y: 250 + Math.random() * 400, size: 130, width: 200, height: 130, shape: 'circle' as Shape } }
        saveLayout(next)
        return next
      })
    }
    setSaving(false)
    setAddModal(false)
    setAddForm({ number: '', name: '', capacity: '8' })
  }

  // ─── Derived ─────────────────────────────────────────────────
  const sel = tables.find(t => t.id === selectedId) ?? null
  const selL = selectedId ? layout[selectedId] : null
  const selGuests = sel ? guests.filter(g => g.table_id === sel.id) : []
  const unassigned = guests.filter(g =>
    !g.table_id && g.full_name.toLowerCase().includes(guestSearch.toLowerCase())
  )

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mesas</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {tables.length} mesas · arrastra para mover · esquina inferior para redimensionar
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { localStorage.removeItem(STORAGE_KEY); setLayout(loadLayout(tables)) }}
            title="Resetear posiciones"
            className="p-2 text-slate-500 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 bg-rose-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-rose-700 transition-colors"
          >
            <Plus size={16} /> Agregar mesa
          </button>
        </div>
      </div>

      {/* Body: canvas + config panel */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Canvas ── */}
        <div
          className="flex-1 overflow-auto select-none"
          style={{
            background: '#f8fafc',
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
          onClick={() => setSelectedId(null)}
        >
          <div style={{ width: 2200, height: 1400, position: 'relative' }}>
            {!loading && tables.map(table => {
              const l = layout[table.id]
              if (!l) return null

              const { w, h } = containerSize(l)
              const cx = w / 2, cy = h / 2
              const tGuests = guests.filter(g => g.table_id === table.id)
              const seats = getSeats(l, table.capacity)
              const isSelected = selectedId === table.id

              const tableW = l.shape === 'circle' ? l.size : l.width
              const tableH = l.shape === 'circle' ? l.size : l.height
              const borderR = l.shape === 'circle' ? '50%' : 10

              return (
                <div
                  key={table.id}
                  style={{ position: 'absolute', left: l.x - cx, top: l.y - cy, width: w, height: h, cursor: 'grab' }}
                  onMouseDown={e => { setSelectedId(table.id); startDrag(e, table.id) }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Seat indicators */}
                  {seats.map((s, i) => {
                    const g = tGuests[i]
                    return (
                      <div
                        key={i}
                        title={g?.full_name ?? 'Asiento libre'}
                        style={{
                          position: 'absolute', left: s.x, top: s.y,
                          width: SD, height: SD, borderRadius: '50%',
                          background: g ? SEAT_COLOR[g.rsvp_status] : '#e2e8f0',
                          border: '2px solid white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    )
                  })}

                  {/* Table surface */}
                  <div
                    style={{
                      position: 'absolute',
                      left: cx - tableW / 2, top: cy - tableH / 2,
                      width: tableW, height: tableH,
                      borderRadius: borderR,
                      background: 'white',
                      border: isSelected ? '3px solid #f43f5e' : '2.5px solid #e2e8f0',
                      boxShadow: isSelected
                        ? '0 0 0 4px rgba(244,63,94,0.15), 0 4px 12px rgba(0,0,0,0.12)'
                        : '0 2px 8px rgba(0,0,0,0.08)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: 2,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                      Mesa {table.number}
                    </span>
                    {table.name && (
                      <span style={{ fontSize: 10, color: '#64748b' }}>{table.name}</span>
                    )}
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>
                      {tGuests.length}/{table.capacity}
                    </span>
                  </div>

                  {/* Resize handle (bottom-right corner) */}
                  <div
                    onMouseDown={e => startResize(e, table.id)}
                    style={{
                      position: 'absolute', right: 2, bottom: 2,
                      width: 16, height: 16, borderRadius: '50%',
                      background: isSelected ? '#f43f5e' : '#94a3b8',
                      cursor: 'nwse-resize',
                      opacity: isSelected ? 0.9 : 0.35,
                      border: '2px solid white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'opacity 0.15s',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Config panel ── */}
        {sel && selL && (
          <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0" style={{ overflow: 'hidden' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
              <h2 className="font-semibold text-slate-900 text-sm">Mesa {sel.number}</h2>
              <button onClick={() => setSelectedId(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">

              {/* ── Properties ── */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Número</label>
                    <input
                      type="number"
                      key={sel.id + '-num'}
                      defaultValue={sel.number}
                      onBlur={e => updateTable(sel.id, { number: parseInt(e.target.value) || sel.number })}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Capacidad</label>
                    <input
                      type="number"
                      key={sel.id + '-cap'}
                      defaultValue={sel.capacity}
                      min={1}
                      onBlur={e => updateTable(sel.id, { capacity: Math.max(1, parseInt(e.target.value) || sel.capacity) })}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nombre (opcional)</label>
                  <input
                    type="text"
                    key={sel.id + '-name'}
                    defaultValue={sel.name ?? ''}
                    onBlur={e => updateTable(sel.id, { name: e.target.value.trim() || null })}
                    placeholder="Familia, Amigos..."
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Shape */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Forma</label>
                  <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                    {(['circle', 'rect'] as Shape[]).map(shape => (
                      <button
                        key={shape}
                        onClick={() => patchLayout(sel.id, { shape })}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                          selL.shape === shape ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        )}
                      >
                        {shape === 'circle' ? <Circle size={11} /> : <Square size={11} />}
                        {shape === 'circle' ? 'Circular' : 'Rectangular'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size sliders */}
                {selL.shape === 'circle' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Diámetro: {Math.round(selL.size)}px
                    </label>
                    <input type="range" min={80} max={280} value={selL.size}
                      onChange={e => patchLayout(sel.id, { size: parseInt(e.target.value) })}
                      className="w-full accent-rose-600" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Ancho: {Math.round(selL.width)}px
                      </label>
                      <input type="range" min={100} max={420} value={selL.width}
                        onChange={e => patchLayout(sel.id, { width: parseInt(e.target.value) })}
                        className="w-full accent-rose-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Alto: {Math.round(selL.height)}px
                      </label>
                      <input type="range" min={80} max={320} value={selL.height}
                        onChange={e => patchLayout(sel.id, { height: parseInt(e.target.value) })}
                        className="w-full accent-rose-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Guests at this table ── */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Invitados ({selGuests.length}/{sel.capacity})
                </h3>
                {selGuests.length === 0 ? (
                  <p className="text-xs text-slate-400">Sin invitados asignados</p>
                ) : (
                  <div className="space-y-0.5">
                    {selGuests.map(g => (
                      <div key={g.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 group">
                        <div>
                          <p className="text-xs font-medium text-slate-800 leading-tight">{g.full_name}</p>
                          <p className={cn('text-xs leading-tight', {
                            'text-green-600': g.rsvp_status === 'confirmed',
                            'text-amber-500': g.rsvp_status === 'pending',
                            'text-red-500':   g.rsvp_status === 'declined',
                          })}>
                            {g.rsvp_status === 'confirmed' ? 'Confirmado' : g.rsvp_status === 'pending' ? 'Pendiente' : 'Declinado'}
                          </p>
                        </div>
                        <button
                          onClick={() => unassignGuest(g.id)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Add guest ── */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Agregar invitado
                </h3>
                <input
                  value={guestSearch}
                  onChange={e => setGuestSearch(e.target.value)}
                  placeholder="Buscar invitado sin mesa..."
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 mb-1.5"
                />
                <div className="max-h-44 overflow-y-auto space-y-0.5">
                  {unassigned.slice(0, 30).map(g => (
                    <button
                      key={g.id}
                      onClick={() => assignGuest(g.id, sel.id)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-xs text-slate-700 hover:text-rose-700 transition-colors"
                    >
                      {g.full_name}
                    </button>
                  ))}
                  {unassigned.length === 0 && (
                    <p className="text-xs text-slate-400 px-1">
                      {guestSearch ? 'Sin resultados' : 'Todos los invitados están asignados'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delete */}
            <div className="p-4 border-t border-slate-200 shrink-0">
              <button
                onClick={() => deleteTable(sel.id)}
                className="w-full flex items-center justify-center gap-2 text-red-600 border border-red-200 rounded-lg py-2 text-xs font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} /> Eliminar mesa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add table modal ── */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Agregar mesa</h2>
              <button onClick={() => setAddModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Número *</label>
                  <input type="number" value={addForm.number}
                    onChange={e => setAddForm(f => ({ ...f, number: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    min="1" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Capacidad *</label>
                  <input type="number" value={addForm.capacity}
                    onChange={e => setAddForm(f => ({ ...f, capacity: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    min="1" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nombre (opcional)</label>
                <input value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Familia, Amigos..." />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setAddModal(false)}
                className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleAddTable}
                disabled={!addForm.number || !addForm.capacity || saving}
                className="flex-1 bg-rose-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors">
                {saving ? 'Guardando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
