import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowLeft, Check, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { RsvpSubmission } from '@/types/database'

const STORAGE_KEY = 'wedding_rsvp_submission'

type Step = 'name' | 'form' | 'confirmed'

function loadSaved(): RsvpSubmission | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

function saveSub(s: RsvpSubmission) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* noop */ }
}

export default function RSVP() {
  const saved = loadSaved()
  const [step, setStep] = useState<Step>(saved ? 'confirmed' : 'name')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [submission, setSubmission] = useState<RsvpSubmission | null>(saved)

  const handleNameSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) return
    setStep('form')
  }

  const handleConfirmed = (s: RsvpSubmission) => {
    saveSub(s)
    setSubmission(s)
    setStep('confirmed')
  }

  const handleChangeGuest = () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
    setFirstName('')
    setLastName('')
    setSubmission(null)
    setStep('name')
  }

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-lg">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <h1 className="font-heading text-3xl font-bold text-primary">
          Confirmar Asistencia
        </h1>
        <p className="mt-2 text-sm text-muted">
          {step === 'name' && 'Ingresa tu nombre para continuar.'}
          {step === 'form' && 'Completa tu confirmación.'}
          {step === 'confirmed' && '¡Gracias por confirmar!'}
        </p>

        <div className="mt-8">
          {step === 'name' && (
            <NameForm
              firstName={firstName}
              lastName={lastName}
              onFirstName={setFirstName}
              onLastName={setLastName}
              onSubmit={handleNameSubmit}
            />
          )}
          {step === 'form' && (
            <RSVPForm
              fullName={fullName}
              onConfirmed={handleConfirmed}
              onChangeGuest={handleChangeGuest}
            />
          )}
          {step === 'confirmed' && submission && (
            <Confirmation submission={submission} onChangeGuest={handleChangeGuest} />
          )}
        </div>
      </div>
    </main>
  )
}

function NameForm({
  firstName,
  lastName,
  onFirstName,
  onLastName,
  onSubmit,
}: {
  firstName: string
  lastName: string
  onFirstName: (v: string) => void
  onLastName: (v: string) => void
  onSubmit: () => void
}) {
  const valid = firstName.trim().length > 0 && lastName.trim().length > 0

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-primary">
          Nombre
        </label>
        <input
          id="firstName"
          type="text"
          placeholder="Ej: Nicolás"
          value={firstName}
          onChange={e => onFirstName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && valid && onSubmit()}
          autoFocus
          className="w-full rounded-xl border border-secondary bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-primary">
          Apellido
        </label>
        <input
          id="lastName"
          type="text"
          placeholder="Ej: Errazuriz"
          value={lastName}
          onChange={e => onLastName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && valid && onSubmit()}
          className="w-full rounded-xl border border-secondary bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={!valid}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        Continuar
      </button>
    </div>
  )
}

function RSVPForm({
  fullName,
  onConfirmed,
  onChangeGuest,
}: {
  fullName: string
  onConfirmed: (s: RsvpSubmission) => void
  onChangeGuest: () => void
}) {
  const [attending, setAttending] = useState<boolean | null>(null)
  const [dietary, setDietary] = useState('')
  const [hasPlusOne, setHasPlusOne] = useState(false)
  const [plusOneName, setPlusOneName] = useState('')
  const [plusOneDietary, setPlusOneDietary] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (attending === null) return

    setSubmitting(true)
    setError('')

    const now = new Date().toISOString()
    const payload = {
      id: crypto.randomUUID(),
      entered_name: fullName,
      rsvp_status: (attending ? 'confirmed' : 'declined') as 'confirmed' | 'declined',
      dietary_restrictions: attending ? dietary || null : null,
      plus_one_name: attending && hasPlusOne ? plusOneName || null : null,
      plus_one_dietary: attending && hasPlusOne ? plusOneDietary || null : null,
    }

    const { error: err } = await supabase
      .from('rsvp_submissions')
      .insert(payload)

    if (err) {
      setError('Hubo un error al enviar. Intenta de nuevo.')
      setSubmitting(false)
      return
    }

    onConfirmed({
      ...payload,
      linked_guest_id: null,
      created_at: now,
      updated_at: now,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-secondary bg-white px-4 py-3">
        <p className="font-medium text-primary">{fullName}</p>
        <button
          type="button"
          onClick={onChangeGuest}
          className="text-xs text-muted underline hover:text-primary"
        >
          Cambiar
        </button>
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium">
          ¿Confirmas tu asistencia?
        </legend>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAttending(true)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-colors ${
              attending === true
                ? 'border-primary bg-primary text-white'
                : 'border-secondary bg-white text-primary hover:border-primary'
            }`}
          >
            <Check className="h-4 w-4" />
            Asistiré
          </button>
          <button
            type="button"
            onClick={() => setAttending(false)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-colors ${
              attending === false
                ? 'border-red-400 bg-red-400 text-white'
                : 'border-secondary bg-white text-primary hover:border-red-400'
            }`}
          >
            <X className="h-4 w-4" />
            No podré
          </button>
        </div>
      </fieldset>

      {attending && (
        <>
          <div>
            <label htmlFor="dietary" className="mb-1 block text-sm font-medium">
              Restricciones alimentarias
            </label>
            <input
              id="dietary"
              type="text"
              placeholder="Vegetariano, alergia a mariscos, etc."
              value={dietary}
              onChange={e => setDietary(e.target.value)}
              className="w-full rounded-xl border border-secondary bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPlusOne}
              onChange={e => setHasPlusOne(e.target.checked)}
              className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Vengo con acompañante</span>
          </label>

          {hasPlusOne && (
            <div className="space-y-3 rounded-xl border border-secondary bg-white p-4">
              <p className="text-sm font-medium">Acompañante</p>
              <input
                type="text"
                placeholder="Nombre del acompañante"
                value={plusOneName}
                onChange={e => setPlusOneName(e.target.value)}
                className="w-full rounded-lg border border-secondary px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
              />
              <input
                type="text"
                placeholder="Restricciones alimentarias (opcional)"
                value={plusOneDietary}
                onChange={e => setPlusOneDietary(e.target.value)}
                className="w-full rounded-lg border border-secondary px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
          )}
        </>
      )}

      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={attending === null || submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className="h-4 w-4" />
        )}
        {submitting ? 'Enviando...' : 'Enviar Confirmación'}
      </button>
    </form>
  )
}

function Confirmation({
  submission,
  onChangeGuest,
}: {
  submission: RsvpSubmission
  onChangeGuest: () => void
}) {
  const confirmed = submission.rsvp_status === 'confirmed'
  const firstName = submission.entered_name.split(' ')[0]

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full ${
          confirmed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
        }`}
      >
        {confirmed ? (
          <Check className="h-8 w-8" />
        ) : (
          <X className="h-8 w-8" />
        )}
      </div>

      <h2 className="mt-4 font-heading text-2xl font-bold text-primary">
        {confirmed ? '¡Nos vemos ahí!' : 'Te echaremos de menos'}
      </h2>

      <p className="mt-2 text-sm text-muted">
        {confirmed
          ? `Muchas gracias por confirmar ${firstName}, estamos felices de contar contigo, ¡nos vemos en el matrimonio!`
          : `Lamentamos que no puedas asistir, ${firstName}. ¡Te tendremos presente!`}
      </p>

      {confirmed && submission.dietary_restrictions && (
        <p className="mt-3 text-xs text-muted">
          Restricciones: {submission.dietary_restrictions}
        </p>
      )}

      {confirmed && submission.plus_one_name && (
        <p className="mt-1 text-xs text-muted">
          Acompañante: {submission.plus_one_name}
        </p>
      )}

      {confirmed && (
        <a
          href="https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=NTNucmQ1dDJqN3NtNXA4YXJzZHVhazdtdXQgbmljb2xhcy5lcnJhenVyaXouYkBt&tmsrc=nicolas.errazuriz.b%40gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-white px-6 py-3 text-sm font-medium text-primary shadow-sm transition-all hover:bg-primary/5 hover:shadow-md"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Guardar en Google Calendar
        </a>
      )}

      <button
        onClick={onChangeGuest}
        className="mt-4 text-xs text-muted underline hover:text-primary"
      >
        No soy yo
      </button>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        <Heart className="h-4 w-4" />
        Volver al inicio
      </Link>
    </div>
  )
}
