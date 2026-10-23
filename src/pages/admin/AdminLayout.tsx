import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, ClipboardList, LayoutGrid, LogOut, Link2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/guests', label: 'Invitados', icon: Users, end: false },
  { to: '/admin/rsvp', label: 'Confirmaciones', icon: ClipboardList, end: false },
  { to: '/admin/submissions', label: 'Vinculaciones', icon: Link2, end: false },
  { to: '/admin/tables', label: 'Mesas', icon: LayoutGrid, end: false },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 fixed h-full">
        <div className="p-5 border-b border-slate-200">
          <p className="font-bold text-slate-900 text-sm">Nico & Cote</p>
          <p className="text-slate-400 text-xs">Admin · Dic 2026</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-56 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
