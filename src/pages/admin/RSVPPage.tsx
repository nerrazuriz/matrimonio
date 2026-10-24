import { useEffect, useState, useMemo } from 'react'
import { Link2, Unlink, Search, X, Check, Pencil, Trash2, RefreshCw, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Guest, RsvpMode, RsvpSubmission } from '@/types/database'
import { cn } from '@/lib/cn'

const normalize = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()

const statusBadge = {
  confirmed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
}

const statusLabel = {
  confirmed: 'Confirmado',
  declined: 'Declinado',
}

const modeBadge: Record<RsvpMode, string> = {
  easy: 'bg-slate-100 text-slate-600',
  hard: 'bg-blue-100 text-blue-700',
  expert: 'bg-slate-900 text-white',
}

const modeLabel: Record<RsvpMode, string> = {
  easy: 'Fácil',
  hard: 'Difícil (versión anterior)',
  expert: 'Difícil · concursa',
}

type Filter = 'all' | 'unlinked' | 'linked' | 'expert'

type EditForm = {
  entered_name: string
  rsvp_status: 'confirmed' | 'declined'
  plus_one: boolean
  dietary_restrictions: string
}

export default function RSVPPage() {
  const [submissions, setSubmissions] = useState<RsvpSubmission[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [tableQuery, setTableQuery] = useState('')
  const [error, setError] = useState('')

  const [linkTarget, setLinkTarget] = useState<RsvpSubmission | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const [editTarget, setEditTarget] = useState<RsvpSubmission | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [winner, setWinner] = useState<RsvpSubmission | null>(null)

  async function load() {
    const [{ data: subs, error: e1 }, { data: gs, error: e2 }] = await Promise.all([
      supabase.from('rsvp_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('guests').select('*').order('full_name'),
    ])
    setError(e1 || e2 ? 'No se pudieron cargar los datos.' : '')
    setSubmissions((subs ?? []) as RsvpSubmission[])
    setGuests((gs ?? []) as Guest[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function refresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const linkedGuestIds = new Set(
    submissions.filter(s => s.linked_guest_id).map(s => s.linked_guest_id!)
  )

  const guestMap = useMemo(
    () => Object.fromEntries(guests.map(g => [g.id, g])),
    [guests]
  )

  const filteredGuests = useMemo(() => {
    const nq = normalize(searchQuery)
    return nq.length < 1
      ? guests
      : guests.filter(g => normalize(g.full_name).includes(nq))
  }, [guests, searchQuery])

  const linked = submissions.filter(s => s.linked_guest_id)
  const unlinked = submissions.filter(s => !s.linked_guest_id)
  const confirmedSubs = submissions.filter(s => s.rsvp_status === 'confirmed')
  const totalPeople = confirmedSubs.length + confirmedSubs.filter(s => s.plus_one).length
  const officialPending = guests.filter(
    g => g.rsvp_status === 'pending' && !linkedGuestIds.has(g.id)
  )

  const experts = confirmedSubs.filter(s => s.rsvp_mode === 'expert')

  const byFilter =
    filter === 'linked' ? linked
      : filter === 'unlinked' ? unlinked
        : filter === 'expert' ? experts
          : submissions
  const tableNq = normalize(tableQuery)
  const visible = tableNq ? byFilter.filter(s => normalize(s.entered_name).includes(tableNq)) : byFilter

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: `Todas (${submissions.length})` },
    { key: 'unlinked', label: `Sin vincular (${unlinked.length})` },
    { key: 'linked', label: `Vinculadas (${linked.length})` },
    { key: 'expert', label: `Concursan (${experts.length})` },
  ]

  function drawWinner() {
    if (experts.length === 0) return
    const pool = experts.length > 1 && winner ? experts.filter(s => s.id !== winner.id) : experts
    setWinner(pool[Math.floor(Math.random() * pool.length)]!)
  }

  async function handleLink(guest: Guest) {
    if (!linkTarget) return
    setBusyId(linkTarget.id)
    const now = new Date().toISOString()
    const { error: e1 } = await supabase
      .from('rsvp_submissions')
      .update({ linked_guest_id: guest.id, updated_at: now })
      .eq('id', linkTarget.id)

    const { error: e2 } = await supabase
      .from('guests')
      .update({
        rsvp_status: linkTarget.rsvp_status,
        dietary_restrictions: linkTarget.dietary_restrictions,
        plus_one: linkTarget.plus_one,
        plus_one_name: linkTarget.plus_one_name,
        plus_one_dietary: linkTarget.plus_one_dietary,
        updated_at: now,
      })
      .eq('id', guest.id)

    if (e1 || e2) {
      setError('No se pudo vincular. Intenta de nuevo.')
    } else {
      setLinkTarget(null)
      setSearchQuery('')
      await load()
    }
    setBusyId(null)
  }

  async function resetGuest(guestId: string) {
    return supabase
      .from('guests')
      .update({ rsvp_status: 'pending', updated_at: new Date().toISOString() })
      .eq('id', guestId)
  }

  async function handleUnlink(sub: RsvpSubmission) {
    if (!sub.linked_guest_id) return
    setBusyId(sub.id)
    const { error: e1 } = await supabase
      .from('rsvp_submissions')
      .update({ linked_guest_id: null, updated_at: new Date().toISOString() })
      .eq('id', sub.id)
    const { error: e2 } = await resetGuest(sub.linked_guest_id)

    if (e1 || e2) setError('No se pudo desvincular. Intenta de nuevo.')
    else await load()
    setBusyId(null)
  }

  async function handleDelete(sub: RsvpSubmission) {
    const linkedName = sub.linked_guest_id ? guestMap[sub.linked_guest_id]?.full_name : null
    const msg = linkedName
      ? `¿Eliminar la confirmación de "${sub.entered_name}"?\n\n${linkedName} volverá a quedar pendiente en la lista oficial.`
      : `¿Eliminar la confirmación de "${sub.entered_name}"?`
    if (!window.confirm(msg)) return

    setBusyId(sub.id)
    const { error: e1 } = await supabase.from('rsvp_submissions').delete().eq('id', sub.id)
    const e2 = !e1 && sub.linked_guest_id ? (await resetGuest(sub.linked_guest_id)).error : null

    if (e1 || e2) setError('No se pudo eliminar. Intenta de nuevo.')
    else await load()
    setBusyId(null)
  }

  function openEdit(sub: RsvpSubmission) {
    setEditTarget(sub)
    setEditForm({
      entered_name: sub.entered_name,
      rsvp_status: sub.rsvp_status,
      plus_one: !!sub.plus_one,
      dietary_restrictions: sub.dietary_restrictions ?? '',
    })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget || !editForm || !editForm.entered_name.trim()) return
    setSaving(true)
    const now = new Date().toISOString()
    const fields = {
      rsvp_status: editForm.rsvp_status,
      plus_one: editForm.plus_one,
      dietary_restrictions: editForm.dietary_restrictions.trim() || null,
    }

    const { error: e1 } = await supabase
      .from('rsvp_submissions')
      .update({ ...fields, entered_name: editForm.entered_name.trim(), updated_at: now })
      .eq('id', editTarget.id)

    const e2 = !e1 && editTarget.linked_guest_id
      ? (await supabase
          .from('guests')
          .update({ ...fields, updated_at: now })
          .eq('id', editTarget.linked_guest_id)).error
      : null

    if (e1 || e2) {
      setError('No se pudieron guardar los cambios. Intenta de nuevo.')
    } else {
      setEditTarget(null)
      setEditForm(null)
      await load()
    }
    setSaving(false)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Confirmaciones</h1>
          <p className="text-slate-500 text-sm">
            Respuestas recibidas desde el formulario. Vincúlalas con la lista oficial de invitados.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={drawWinner}
            disabled={experts.length === 0}
            title={experts.length === 0 ? 'Aún nadie ha completado el modo difícil' : undefined}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40"
          >
            <Trophy size={14} />
            Sortear ganador
          </button>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={cn(refreshing && 'animate-spin')} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Stat value={submissions.length} label="Confirmaciones recibidas" />
        <Stat value={totalPeople} label="Personas (incl. acompañantes)" />
        <Stat value={unlinked.length} label="Sin vincular" className="text-amber-600" />
        <Stat value={officialPending.length} label="Pendientes en lista oficial" className="text-slate-500" />
        <Stat value={experts.length} label="Concursan por cotillón" />
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError('')} className="p-1 hover:text-red-900"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={tableQuery}
            onChange={e => setTableQuery(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-64 pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
        ) : visible.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            {submissions.length === 0 ? 'No hay confirmaciones aún.' : 'Sin resultados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Nombre ingresado</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Modo</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Acompañante</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Restricciones</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Vinculado a</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map(sub => {
                  const linkedGuest = sub.linked_guest_id ? guestMap[sub.linked_guest_id] : null
                  const busy = busyId === sub.id
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{sub.entered_name}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusBadge[sub.rsvp_status])}>
                          {statusLabel[sub.rsvp_status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {sub.rsvp_mode ? (
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', modeBadge[sub.rsvp_mode])}>
                            {modeLabel[sub.rsvp_mode]}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {sub.plus_one_name || (sub.plus_one ? 'Sí' : 'No')}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-xs">
                        {sub.dietary_restrictions || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {linkedGuest ? (
                          <span className="flex items-center gap-1.5 text-green-700 text-sm">
                            <Check className="h-3.5 w-3.5" />
                            {linkedGuest.full_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Sin vincular</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(sub.created_at).toLocaleDateString('es-CL', {
                          day: '2-digit', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {linkedGuest ? (
                            <IconButton title="Desvincular" onClick={() => handleUnlink(sub)} disabled={busy} danger>
                              <Unlink size={14} />
                            </IconButton>
                          ) : (
                            <button
                              onClick={() => { setLinkTarget(sub); setSearchQuery('') }}
                              disabled={busy}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              <Link2 size={12} />
                              Vincular
                            </button>
                          )}
                          <IconButton title="Editar" onClick={() => openEdit(sub)} disabled={busy}>
                            <Pencil size={14} />
                          </IconButton>
                          <IconButton title="Eliminar" onClick={() => handleDelete(sub)} disabled={busy} danger>
                            <Trash2 size={14} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {officialPending.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h2 className="font-medium text-slate-800">
              Pendientes en lista oficial ({officialPending.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Invitados que aún no tienen confirmación vinculada</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Grupo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officialPending.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">{g.full_name}</td>
                    <td className="px-4 py-3 text-slate-500">{g.group_label || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {linkTarget && (
        <Modal
          title="Vincular confirmación"
          subtitle={`"${linkTarget.entered_name}" → invitado oficial`}
          onClose={() => setLinkTarget(null)}
        >
          <div className="p-4 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar en lista oficial..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredGuests.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-400">Sin resultados</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredGuests.map(g => {
                  const alreadyLinked = linkedGuestIds.has(g.id)
                  return (
                    <li key={g.id}>
                      <button
                        onClick={() => !alreadyLinked && handleLink(g)}
                        disabled={busyId !== null || alreadyLinked}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
                          alreadyLinked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-rose-50'
                        )}
                      >
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{g.full_name}</p>
                          {g.group_label && <p className="text-xs text-slate-400">{g.group_label}</p>}
                        </div>
                        {alreadyLinked && <span className="text-xs text-slate-400 italic">Ya vinculado</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Modal>
      )}

      {winner && (
        <Modal
          title="Sorteo del cotillón especial"
          subtitle={`Entre ${experts.length} ${experts.length === 1 ? 'persona que completó' : 'personas que completaron'} el modo difícil`}
          onClose={() => setWinner(null)}
        >
          <div className="p-6 text-center">
            <Trophy className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">Ganador</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{winner.entered_name}</p>
            {winner.linked_guest_id && guestMap[winner.linked_guest_id] && (
              <p className="mt-1 text-sm text-slate-500">Lista oficial: {guestMap[winner.linked_guest_id]!.full_name}</p>
            )}
            <div className="mt-6 flex justify-center gap-2">
              {experts.length > 1 && (
                <button onClick={drawWinner} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">
                  Sortear de nuevo
                </button>
              )}
              <button
                onClick={() => setWinner(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-sm font-medium text-white hover:bg-slate-800"
              >
                Listo
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editTarget && editForm && (
        <Modal
          title="Editar confirmación"
          subtitle={editTarget.linked_guest_id ? 'Los cambios también se aplicarán al invitado vinculado.' : undefined}
          onClose={() => { setEditTarget(null); setEditForm(null) }}
        >
          <form onSubmit={handleSave} className="p-5 space-y-4">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Nombre ingresado</span>
              <input
                autoFocus
                value={editForm.entered_name}
                onChange={e => setEditForm(f => f && { ...f, entered_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Estado</span>
              <select
                value={editForm.rsvp_status}
                onChange={e => setEditForm(f => f && { ...f, rsvp_status: e.target.value as EditForm['rsvp_status'] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="confirmed">Confirmado</option>
                <option value="declined">Declinado</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.plus_one}
                onChange={e => setEditForm(f => f && { ...f, plus_one: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Viene con acompañante</span>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Restricciones alimentarias</span>
              <input
                value={editForm.dietary_restrictions}
                onChange={e => setEditForm(f => f && { ...f, dietary_restrictions: e.target.value })}
                placeholder="Ninguna"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setEditTarget(null); setEditForm(null) }}
                className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !editForm.entered_name.trim()}
                className="px-4 py-2 rounded-lg bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Stat({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className={cn('text-2xl font-bold text-slate-900', className)}>{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function IconButton({ title, onClick, disabled, danger, children }: {
  title: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        'p-1.5 rounded-lg text-slate-400 transition-colors disabled:opacity-50',
        danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-slate-100 hover:text-slate-700'
      )}
    >
      {children}
    </button>
  )
}

function Modal({ title, subtitle, onClose, children }: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
