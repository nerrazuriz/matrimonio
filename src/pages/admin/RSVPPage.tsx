import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Guest } from '@/types/database'
import { cn } from '@/lib/cn'

type Tab = 'all' | 'confirmed' | 'pending' | 'declined'

const statusBadge = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  declined: 'bg-red-100 text-red-700',
}

const statusLabel = {
  confirmed: 'Confirmado',
  pending: 'Pendiente',
  declined: 'Declinado',
}

export default function RSVPPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('all')

  useEffect(() => {
    supabase
      .from('guests')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setGuests(data ?? [])
        setLoading(false)
      })
  }, [])

  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed')
  const pending = guests.filter(g => g.rsvp_status === 'pending')
  const declined = guests.filter(g => g.rsvp_status === 'declined')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: `Todos (${guests.length})` },
    { key: 'confirmed', label: `Confirmados (${confirmed.length})` },
    { key: 'pending', label: `Pendientes (${pending.length})` },
    { key: 'declined', label: `Declinados (${declined.length})` },
  ]

  const filtered = tab === 'all' ? guests
    : tab === 'confirmed' ? confirmed
    : tab === 'pending' ? pending
    : declined

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Confirmaciones RSVP</h1>
      <p className="text-slate-500 text-sm mb-6">Respuestas de los invitados</p>

      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              tab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Sin resultados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Restricción dietaria</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Acompañante</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{g.full_name}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusBadge[g.rsvp_status])}>
                        {statusLabel[g.rsvp_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{g.dietary_restrictions || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {g.plus_one_name
                        ? <>
                            {g.plus_one_name}
                            {g.plus_one_dietary && (
                              <span className="text-xs text-slate-400 ml-1">({g.plus_one_dietary})</span>
                            )}
                          </>
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(g.updated_at).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
