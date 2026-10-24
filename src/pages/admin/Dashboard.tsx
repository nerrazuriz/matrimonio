import { useEffect, useState } from 'react'
import { Users, CheckCircle, Clock, XCircle, Heart, Utensils } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Guest } from '@/types/database'
import { cn } from '@/lib/cn'

export default function Dashboard() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('guests').select('*').then(({ data }) => {
      setGuests(data ?? [])
      setLoading(false)
    })
  }, [])

  const total = guests.length
  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed').length
  const pending = guests.filter(g => g.rsvp_status === 'pending').length
  const declined = guests.filter(g => g.rsvp_status === 'declined').length
  const plusOnes = guests.filter(g => g.rsvp_status === 'confirmed' && (g.plus_one || g.plus_one_name)).length
  const totalAttending = confirmed + plusOnes

  const dietaryMap = new Map<string, number>()
  guests.forEach(g => {
    if (g.rsvp_status !== 'confirmed') return
    if (g.dietary_restrictions) {
      dietaryMap.set(g.dietary_restrictions, (dietaryMap.get(g.dietary_restrictions) ?? 0) + 1)
    }
    if (g.plus_one_dietary) {
      dietaryMap.set(g.plus_one_dietary, (dietaryMap.get(g.plus_one_dietary) ?? 0) + 1)
    }
  })

  const stats = [
    { label: 'Total invitados', value: total, icon: Users, color: 'bg-slate-100 text-slate-700' },
    { label: 'Confirmados', value: confirmed, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { label: 'Pendientes', value: pending, icon: Clock, color: 'bg-amber-100 text-amber-700' },
    { label: 'Declinados', value: declined, icon: XCircle, color: 'bg-red-100 text-red-700' },
    { label: 'Con acompañante', value: plusOnes, icon: Heart, color: 'bg-pink-100 text-pink-700' },
    { label: 'Total asistentes', value: totalAttending, icon: Users, color: 'bg-rose-100 text-rose-700' },
  ]

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
      <p className="text-slate-500 text-sm mb-6">Resumen del matrimonio</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
                <span className={cn('inline-flex p-2 rounded-lg mb-3', color)}>
                  <Icon size={16} />
                </span>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {total > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
              <h2 className="font-semibold text-slate-900 text-sm mb-3">Progreso RSVP</h2>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-2">
                <div className="bg-green-500" style={{ width: `${(confirmed / total) * 100}%` }} />
                <div className="bg-amber-400" style={{ width: `${(pending / total) * 100}%` }} />
                <div className="bg-red-400" style={{ width: `${(declined / total) * 100}%` }} />
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Confirmados {Math.round((confirmed / total) * 100)}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-400 rounded-full" />
                  Pendientes {Math.round((pending / total) * 100)}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-400 rounded-full" />
                  Declinados {Math.round((declined / total) * 100)}%
                </span>
              </div>
            </div>
          )}

          {dietaryMap.size > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Utensils size={15} className="text-slate-400" />
                <h2 className="font-semibold text-slate-900 text-sm">Restricciones dietarias (confirmados)</h2>
              </div>
              <div className="space-y-2">
                {Array.from(dietaryMap.entries()).map(([restriction, count]) => (
                  <div key={restriction} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 capitalize">{restriction}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
