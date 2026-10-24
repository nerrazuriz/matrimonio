import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, X, Loader2, Calendar, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Mountains from '@/components/decor/Mountains'
import { Divider } from '@/components/decor/Ornaments'
import ModeSelect from '@/components/rsvp/ModeSelect'
import Challenge from '@/components/rsvp/Challenge'
import { EXPERT_CHALLENGE } from '@/components/rsvp/challenges'
import type { RsvpMode, RsvpSubmission } from '@/types/database'

const STORAGE_KEY = 'wedding_rsvp_submission'

type Stage = 'choose' | 'expert' | 'form'

const STAGE_HINT: Record<Exclude<Stage, 'expert'>, string> = {
  choose: '¿Cómo quieres confirmar?',
  form: 'Completa tus datos para confirmar.',
}

function clearProgress() {
  try { sessionStorage.removeItem(EXPERT_CHALLENGE.storageKey) } catch { /* noop */ }
}

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
  const [submission, setSubmission] = useState<RsvpSubmission | null>(loadSaved)
  const [stage, setStageState] = useState<Stage>('choose')
  const [mode, setMode] = useState<RsvpMode>('easy')
  const playing = !submission && stage === 'expert'

  const setStage = (s: Stage) => {
    setStageState(s)
    window.scrollTo({ top: 0 })
  }

  const goToForm = (m: RsvpMode) => {
    setMode(m)
    setStage('form')
  }

  const handleConfirmed = (s: RsvpSubmission) => {
    saveSub(s)
    clearProgress()
    setSubmission(s)
  }

  const handleChangeGuest = () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
    clearProgress()
    setStageState('choose')
    setSubmission(null)
  }

  return (
    <main className="flex min-h-svh flex-col bg-gradient-to-b from-secondary/60 via-background to-background">
      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        {!playing && (
          <>
            <div className="mt-10 flex flex-col items-center text-center">
              <h1 className="font-heading text-4xl font-medium text-primary sm:text-5xl">
                Confirmar Asistencia
              </h1>
              <Divider className="mt-5" />
            </div>
            <p className="mt-5 text-center text-sm text-muted">
              {submission ? '¡Gracias por confirmar!' : STAGE_HINT[stage as Exclude<Stage, 'expert'>]}
            </p>
          </>
        )}

        <div className={playing ? 'mt-6' : 'mt-8'}>
          {submission ? (
            <Confirmation submission={submission} onChangeGuest={handleChangeGuest} />
          ) : stage === 'choose' ? (
            <ModeSelect onEasy={() => goToForm('easy')} onHard={() => setStage('expert')} />
          ) : stage === 'expert' ? (
            <Challenge
              config={EXPERT_CHALLENGE}
              onComplete={() => goToForm('expert')}
              onEasy={() => goToForm('easy')}
            />
          ) : (
            <RSVPForm mode={mode} onConfirmed={handleConfirmed} />
          )}
        </div>
      </div>

      <Mountains className="mt-12 h-[22vh] min-h-[140px] max-h-[260px]" />
    </main>
  )
}

const inputClass =
  'w-full rounded-md border border-secondary bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-primary'

function RSVPForm({ mode, onConfirmed }: {
  mode: RsvpMode
  onConfirmed: (s: RsvpSubmission) => void
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [plusOne, setPlusOne] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fullName = `${firstName.trim()} ${lastName.trim()}`
  const canSubmit = firstName.trim() !== '' && lastName.trim() !== '' && plusOne !== null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    setError('')

    const now = new Date().toISOString()
    const payload = {
      id: crypto.randomUUID(),
      entered_name: fullName,
      rsvp_status: 'confirmed' as const,
      dietary_restrictions: null,
      plus_one: plusOne === true,
      plus_one_name: null,
      plus_one_dietary: null,
      rsvp_mode: mode,
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
      challenge_ms: null,
      linked_guest_id: null,
      created_at: now,
      updated_at: now,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium">
            Nombre
          </label>
          <input
            id="firstName"
            type="text"
            required
            autoComplete="given-name"
            placeholder="Tu nombre"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium">
            Apellido
          </label>
          <input
            id="lastName"
            type="text"
            required
            autoComplete="family-name"
            placeholder="Tu apellido"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium">
          ¿Vienes con acompañante?
        </legend>
        <div className="flex gap-3">
          {([
            { value: true, label: 'Sí' },
            { value: false, label: 'No' },
          ] as const).map(({ value, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setPlusOne(value)}
              className={`flex-1 rounded-md border-2 py-3 text-sm font-medium transition-colors ${
                plusOne === value
                  ? 'border-primary bg-primary text-white'
                  : 'border-secondary bg-white text-primary hover:border-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/90 disabled:opacity-40"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
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
          confirmed ? 'bg-primary text-white' : 'bg-secondary text-muted'
        }`}
      >
        {confirmed ? (
          <Check className="h-8 w-8" />
        ) : (
          <X className="h-8 w-8" />
        )}
      </div>

      <h2 className="mt-5 font-heading text-3xl font-medium italic text-primary">
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

      {confirmed && submission.plus_one && (
        <p className="mt-1 text-xs text-muted">Vienes con acompañante</p>
      )}

      {confirmed && submission.rsvp_mode === 'expert' && (
        <div className="mt-6 w-full rounded-md border border-ink bg-ink px-5 py-4 text-white">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">Modo difícil</p>
          <p className="mt-1 font-heading text-xl italic">Estás participando por el cotillón especial</p>
        </div>
      )}

      {confirmed && <AddToCalendarButton />}

      <button
        onClick={onChangeGuest}
        className="mt-4 text-xs text-muted underline hover:text-primary"
      >
        No soy yo
      </button>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-sm bg-primary px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/90"
      >
        Volver al inicio
      </Link>
    </div>
  )
}

const GOOGLE_CAL_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  '&text=Matrimonio+Nico+%26+Cote' +
  '&dates=20261211T180000%2F20261212T033000' +
  '&details=Ceremonia+a+las+18%3A00+hrs+en+la+Iglesia+del+Colegio+Santa+%C3%9Arsula.+Recepci%C3%B3n+en+Hacienda+Porvenir.' +
  '&location=Iglesia+del+Colegio+Santa+%C3%9Arsula'

function downloadIcs() {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Matrimonio Nico & Cote//ES',
    'BEGIN:VEVENT',
    'DTSTART:20261211T180000',
    'DTEND:20261212T033000',
    'SUMMARY:Matrimonio Nico & Cote',
    'LOCATION:Iglesia del Colegio Santa Úrsula',
    'DESCRIPTION:Ceremonia 18:00 hrs. Recepción en Hacienda Porvenir.',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'matrimonio-nico-cote.ics'
  a.click()
  URL.revokeObjectURL(url)
}

function AddToCalendarButton() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative mt-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-sm border border-primary/25 bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-primary transition-colors hover:bg-secondary/50"
      >
        <Calendar className="h-4 w-4" />
        Guardar en mi calendario
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 z-20 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-md border border-secondary bg-white shadow-lg">
            <a
              href={GOOGLE_CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/5"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Calendar
            </a>
            <button
              onClick={() => { downloadIcs(); setOpen(false) }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/5"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Apple Calendar
            </button>
            <button
              onClick={() => { downloadIcs(); setOpen(false) }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/5"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Outlook / Otro
            </button>
          </div>
        </>
      )}
    </div>
  )
}
