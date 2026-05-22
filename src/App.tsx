import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import RSVP from '@/pages/RSVP'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rsvp" element={<RSVP />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
