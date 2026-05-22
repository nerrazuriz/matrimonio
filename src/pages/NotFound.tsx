import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-muted">Esta página no existe.</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>
    </div>
  )
}
