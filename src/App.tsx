import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import RSVP from '@/pages/RSVP'
import NotFound from '@/pages/NotFound'
import AdminLogin from '@/pages/admin/AdminLogin'
import AdminLayout from '@/pages/admin/AdminLayout'
import Dashboard from '@/pages/admin/Dashboard'
import GuestsPage from '@/pages/admin/GuestsPage'
import RSVPPage from '@/pages/admin/RSVPPage'
import SubmissionsPage from '@/pages/admin/SubmissionsPage'
import TablesPage from '@/pages/admin/TablesPage'
import AdminRoute from '@/components/admin/AdminRoute'
import GuestLayout from '@/components/GuestLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/rsvp" element={<RSVP />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/guests" element={<GuestsPage />} />
          <Route path="/admin/rsvp" element={<RSVPPage />} />
          <Route path="/admin/submissions" element={<SubmissionsPage />} />
          <Route path="/admin/tables" element={<TablesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
