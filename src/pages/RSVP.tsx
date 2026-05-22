import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, Heart, ArrowLeft, Check, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useGuest } from '@/hooks/useGuest'
import type { Guest } from '@/types/database'

type Step = 'search' | 'form' | 'confirmed'

export default function RSVP() {
  const { guest: savedGuest, identify } = useGuest()
  const [step, setStep] = useState<Step>(savedGuest ? 'form' : 'search')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(savedGuest)

  const handleSelect = (g: Guest) => {
    setSelectedGuest(g)
    identify(g)
    setStep('form')
  }

  const handleConfirmed = (g: Guest) => {
    setSelectedGuest(g)
    identify(g)
    setStep('confirmed')
  }

  const handleChangeGuest = () => {
    setSelectedGuest(null)
    setStep('search')
  }

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
          {step === 'search' && 'Busca tu nombre para confirmar.'}
          {step === 'form' && 'Completa tu confirmación.'}
          {step === 'confirmed' && '¡Gracias por confirmar!'}
        </p>

        <div className="mt-8">
          {step === 'search' && <GuestSearch onSelect={handleSelect} />}
          {step === 'form' && selectedGuest && (
            <RSVPForm
              guest={selectedGuest}
              onConfirmed={handleConfirmed}
              onChangeGuest={handleChangeGuest}
            />
          )}
          {step === 'confirmed' && selectedGuest && (
            <Confirmation guest={selectedGuest} />
          )}
        </div>
      </div>
    </main>
  )
}

function GuestSearch({ onSelect }: { onSelect: (g: Guest) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Guest[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('guests')
        .select('*')
        .ilike('full_name', `%${query}%`)
        .limit(10)

      setResults((data as Guest[]) ?? [])
      setSearched(true)
      setLoading(false)
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Escribe tu nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full rounded-xl border border-secondary bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />
        )}
      </div>

      {results.length > 0 && (
        <ul className="mt-3 space-y-2">
          {results.map((g) => (
            <li key={g.id}>
              <button
                onClick={() => onSelect(g)}
                className="flex w-full items-center justify-between rounded-xl border border-secondary bg-white px-4 py-3 text-left transition-colors hover:border-primary"
              >
                <div>
                  <p className="font-medium text-primary">{g.full_name}</p>
                  {g.group_label && (
                    <p className="text-xs text-muted">{g.group_label}</p>
                  )}
                </div>
                {g.rsvp_status === 'confirmed' && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    Confirmado
                  </span>
                )}
                {g.rsvp_status === 'declined' && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                    Declinado
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="mt-4 text-center text-sm text-muted">
          No encontramos tu nombre. Verifica la ortografía o contacta a los novios.
        </p>
      )}
    </div>
  )
}

function RSVPForm({
  guest,
  onConfirmed,
  onChangeGuest,
}: {
  guest: Guest
  onConfirmed: (g: Guest) => void
  onChangeGuest: () => void
}) {
  const [attending, setAttending] = useState<boolean | null>(
    guest.rsvp_status === 'confirmed'
      ? true
      : guest.rsvp_status === 'declined'
        ? false
        : null
  )
  const [dietary, setDietary] = useState(guest.dietary_restrictions ?? '')
  const [plusOneName, setPlusOneName] = useState(guest.plus_one_name ?? '')
  const [plusOneDietary, setPlusOneDietary] = useState(guest.plus_one_dietary ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (attending === null) return

    setSubmitting(true)
    setError('')

    const updates: Partial<Guest> = {
      rsvp_status: attending ? 'confirmed' : 'declined',
      dietary_restrictions: attending ? dietary || null : null,
      plus_one_name: attending && guest.plus_one ? plusOneName || null : null,
      plus_one_dietary: attending && guest.plus_one ? plusOneDietary || null : null,
      updated_at: new Date().toISOString(),
    }

    const { error: err } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', guest.id)

    if (err) {
      setError('Hubo un error. Intenta de nuevo.')
      setSubmitting(false)
      return
    }

    onConfirmed({ ...guest, ...updates } as Guest)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-secondary bg-white px-4 py-3">
        <div>
          <p className="font-medium text-primary">{guest.full_name}</p>
          {guest.group_label && (
            <p className="text-xs text-muted">{guest.group_label}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onChangeGuest}
          className="text-xs text-muted underline hover:text-primary"
        >
          Cambiar
        </button>
      </div>

      {/* Attending */}
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
          {/* Dietary */}
          <div>
            <label htmlFor="dietary" className="mb-1 block text-sm font-medium">
              Restricciones alimentarias
            </label>
            <input
              id="dietary"
              type="text"
              placeholder="Vegetariano, alergia a mariscos, etc."
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full rounded-xl border border-secondary bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Plus one */}
          {guest.plus_one && (
            <div className="space-y-3 rounded-xl border border-secondary bg-white p-4">
              <p className="text-sm font-medium">Acompañante</p>
              <input
                type="text"
                placeholder="Nombre del acompañante"
                value={plusOneName}
                onChange={(e) => setPlusOneName(e.target.value)}
                className="w-full rounded-lg border border-secondary px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
              />
              <input
                type="text"
                placeholder="Restricciones alimentarias (opcional)"
                value={plusOneDietary}
                onChange={(e) => setPlusOneDietary(e.target.value)}
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

function Confirmation({ guest }: { guest: Guest }) {
  const confirmed = guest.rsvp_status === 'confirmed'

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
          ? `Gracias por confirmar, ${guest.full_name}. ¡Estamos felices de contar contigo!`
          : `Lamentamos que no puedas asistir, ${guest.full_name}. ¡Te tendremos presente!`}
      </p>

      {confirmed && guest.dietary_restrictions && (
        <p className="mt-3 text-xs text-muted">
          Restricciones: {guest.dietary_restrictions}
        </p>
      )}

      {confirmed && guest.plus_one_name && (
        <p className="mt-1 text-xs text-muted">
          Acompañante: {guest.plus_one_name}
        </p>
      )}

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        <Heart className="h-4 w-4" />
        Volver al inicio
      </Link>
    </div>
  )
}
