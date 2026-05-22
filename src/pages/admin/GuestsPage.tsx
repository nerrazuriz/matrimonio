import { useEffect, useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Guest, Table } from '@/types/database'
import { cn } from '@/lib/cn'

type GuestForm = {
  full_name: string
  email: string
  phone: string
  group_label: string
  table_id: string
  rsvp_status: 'pending' | 'confirmed' | 'declined'
  plus_one: boolean
}

const emptyForm: GuestForm = {
  full_name: '',
  email: '',
  phone: '',
  group_label: '',
  table_id: '',
  rsvp_status: 'pending',
  plus_one: false,
}

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

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'declined'>('all')
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selected, setSelected] = useState<Guest | null>(null)
  const [form, setForm] = useState<GuestForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function load() {
    const [{ data: g }, { data: t }] = await Promise.all([
      supabase.from('guests').select('*').order('full_name'),
      supabase.from('tables').select('*').order('number'),
    ])
    setGuests(g ?? [])
    setTables(t ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() =>
    guests.filter(g => {
      const matchSearch = g.full_name.toLowerCase().includes(search.toLowerCase()) ||
        g.email?.toLowerCase().includes(search.toLowerCase()) ||
        g.phone?.includes(search) ||
        g.group_label?.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'all' || g.rsvp_status === filter
      return matchSearch && matchFilter
    }),
    [guests, search, filter]
  )

  function openAdd() {
    setForm(emptyForm)
    setSelected(null)
    setModal('add')
  }

  function openEdit(g: Guest) {
    setSelected(g)
    setForm({
      full_name: g.full_name,
      email: g.email ?? '',
      phone: g.phone ?? '',
      group_label: g.group_label ?? '',
      table_id: g.table_id ?? '',
      rsvp_status: g.rsvp_status,
      plus_one: g.plus_one,
    })
    setModal('edit')
  }

  function openDelete(g: Guest) {
    setSelected(g)
    setModal('delete')
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email || null,
      phone: form.phone || null,
      group_label: form.group_label || null,
      table_id: form.table_id || null,
      rsvp_status: form.rsvp_status,
      plus_one: form.plus_one,
      updated_at: new Date().toISOString(),
    }

    if (modal === 'add') {
      await supabase.from('guests').insert(payload)
    } else if (modal === 'edit' && selected) {
      await supabase.from('guests').update(payload).eq('id', selected.id)
    }

    setSaving(false)
    setModal(null)
    load()
  }

  async function handleDelete() {
    if (!selected) return
    setSaving(true)
    await supabase.from('guests').delete().eq('id', selected.id)
    setSaving(false)
    setModal(null)
    load()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Invitados</h1>
          <p className="text-slate-500 text-sm">{guests.length} invitados en total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-rose-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-rose-700 transition-colors"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, grupo..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as typeof filter)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
        >
          <option value="all">Todos</option>
          <option value="confirmed">Confirmados</option>
          <option value="pending">Pendientes</option>
          <option value="declined">Declinados</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No hay resultados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Email / Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Grupo</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Mesa</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">+1</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(g => {
                  const table = tables.find(t => t.id === g.table_id)
                  return (
                    <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{g.full_name}</td>
                      <td className="px-4 py-3 text-slate-500">
                        <div>{g.email || '—'}</div>
                        {g.phone && <div className="text-xs">{g.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{g.group_label || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {table ? `Mesa ${table.number}${table.name ? ` · ${table.name}` : ''}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusBadge[g.rsvp_status])}>
                          {statusLabel[g.rsvp_status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {g.plus_one ? (g.plus_one_name || 'Sí') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(g)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => openDelete(g)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* Add / Edit modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">
                {modal === 'add' ? 'Agregar invitado' : 'Editar invitado'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nombre completo *</label>
                <input
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Nombre Apellido"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="+56 9..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Grupo / Familia</label>
                  <input
                    value={form.group_label}
                    onChange={e => setForm(f => ({ ...f, group_label: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Familia, Amigos..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mesa</label>
                  <select
                    value={form.table_id}
                    onChange={e => setForm(f => ({ ...f, table_id: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="">Sin mesa</option>
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>
                        Mesa {t.number}{t.name ? ` · ${t.name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Estado RSVP</label>
                  <select
                    value={form.rsvp_status}
                    onChange={e => setForm(f => ({ ...f, rsvp_status: e.target.value as GuestForm['rsvp_status'] }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="declined">Declinado</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={form.plus_one}
                    onChange={e => setForm(f => ({ ...f, plus_one: e.target.checked }))}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-sm text-slate-700">Tiene acompañante</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.full_name.trim() || saving}
                className="flex-1 bg-rose-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-5">
              <h2 className="font-semibold text-slate-900 mb-2">Eliminar invitado</h2>
              <p className="text-slate-500 text-sm">
                ¿Eliminar a <strong>{selected.full_name}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
