import { useEffect, useState, useMemo } from 'react'
import { Link2, Unlink, Search, X, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Guest, RsvpSubmission } from '@/types/database'
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

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<RsvpSubmission[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [linkTarget, setLinkTarget] = useState<RsvpSubmission | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [linking, setLinking] = useState(false)
  const [unlinking, setUnlinking] = useState<string | null>(null)

  async function load() {
    const [{ data: subs }, { data: gs }] = await Promise.all([
      supabase.from('rsvp_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('guests').select('*').order('full_name'),
    ])
    setSubmissions((subs ?? []) as RsvpSubmission[])
    setGuests((gs ?? []) as Guest[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

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
  const officialPending = guests.filter(
    g => g.rsvp_status === 'pending' && !linkedGuestIds.has(g.id)
  )

  async function handleLink(guest: Guest) {
    if (!linkTarget) return
    setLinking(true)
    const { error: e1 } = await supabase
      .from('rsvp_submissions')
      .update({ linked_guest_id: guest.id, updated_at: new Date().toISOString() })
      .eq('id', linkTarget.id)

    const { error: e2 } = await supabase
      .from('guests')
      .update({
        rsvp_status: linkTarget.rsvp_status,
        dietary_restrictions: linkTarget.dietary_restrictions,
        plus_one_name: linkTarget.plus_one_name,
        plus_one_dietary: linkTarget.plus_one_dietary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', guest.id)

    if (!e1 && !e2) {
      setLinkTarget(null)
      setSearchQuery('')
      await load()
    }
    setLinking(false)
  }

  async function handleUnlink(sub: RsvpSubmission) {
    if (!sub.linked_guest_id) return
    setUnlinking(sub.id)
    const { error: e1 } = await supabase
      .from('rsvp_submissions')
      .update({ linked_guest_id: null, updated_at: new Date().toISOString() })
      .eq('id', sub.id)

    const { error: e2 } = await supabase
      .from('guests')
      .update({ rsvp_status: 'pending', updated_at: new Date().toISOString() })
      .eq('id', sub.linked_guest_id)

    if (!e1 && !e2) await load()
    setUnlinking(null)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Vinculaciones RSVP</h1>
        <p className="text-slate-500 text-sm">
          Cruza las confirmaciones recibidas con la lista oficial de invitados.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{submissions.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Confirmaciones recibidas</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-green-600">{linked.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Vinculadas a lista oficial</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-amber-600">{officialPending.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Pendientes en lista oficial</p>
        </div>
      </div>

      {/* Submissions table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-medium text-slate-800">Confirmaciones</h2>
          {unlinked.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
              {unlinked.length} sin vincular
            </span>
          )}
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No hay confirmaciones aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Nombre ingresado</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Dieta / Acomp.</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Vinculado a</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Fecha</th>
                  <th className="px-4 py-3 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map(sub => {
                  const linkedGuest = sub.linked_guest_id ? guestMap[sub.linked_guest_id] : null
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{sub.entered_name}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusBadge[sub.rsvp_status])}>
                          {statusLabel[sub.rsvp_status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-xs">
                        {sub.dietary_restrictions && (
                          <div>🍽 {sub.dietary_restrictions}</div>
                        )}
                        {sub.plus_one_name && (
                          <div>+1 {sub.plus_one_name}{sub.plus_one_dietary ? ` (${sub.plus_one_dietary})` : ''}</div>
                        )}
                        {!sub.dietary_restrictions && !sub.plus_one_name && '—'}
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
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(sub.created_at).toLocaleDateString('es-CL', {
                          day: '2-digit', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {linkedGuest ? (
                            <button
                              onClick={() => handleUnlink(sub)}
                              disabled={unlinking === sub.id}
                              title="Desvincular"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              <Unlink size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => { setLinkTarget(sub); setSearchQuery('') }}
                              title="Vincular a invitado oficial"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors"
                            >
                              <Link2 size={12} />
                              Vincular
                            </button>
                          )}
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

      {/* Official pending guests */}
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

      {/* Link modal */}
      {linkTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
              <div>
                <h2 className="font-semibold text-slate-900">Vincular confirmación</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  "{linkTarget.entered_name}" → invitado oficial
                </p>
              </div>
              <button
                onClick={() => setLinkTarget(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

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
                          disabled={linking || alreadyLinked}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
                            alreadyLinked
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:bg-rose-50'
                          )}
                        >
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{g.full_name}</p>
                            {g.group_label && (
                              <p className="text-xs text-slate-400">{g.group_label}</p>
                            )}
                          </div>
                          {alreadyLinked && (
                            <span className="text-xs text-slate-400 italic">Ya vinculado</span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
