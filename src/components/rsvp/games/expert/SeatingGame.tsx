import { useEffect, useState } from 'react'
import { GUESTS, GUEST_LABEL, SEATING_CLUES, type Guest } from '@/data/expert'
import type { GameProps } from '../../Challenge'
import { cn } from '@/lib/cn'

type Selection = { kind: 'guest'; guest: Guest } | { kind: 'seat'; seat: number } | null

const SEATS = [0, 1, 2, 3, 4, 5]

export default function SeatingGame({ onWin, onMistake }: GameProps) {
  const [seatOf, setSeatOf] = useState<Record<Guest, number | null>>(
    () => Object.fromEntries(GUESTS.map(g => [g, null])) as Record<Guest, number | null>,
  )
  const [selected, setSelected] = useState<Selection>(null)
  const [result, setResult] = useState<{ failing: number } | null>(null)

  const occupant = (seat: number) => GUESTS.find(g => seatOf[g] === seat) ?? null
  const unseated = GUESTS.filter(g => seatOf[g] === null)
  const solved = result?.failing === 0

  useEffect(() => {
    if (!solved) return
    const id = setTimeout(onWin, 1300)
    return () => clearTimeout(id)
  }, [solved, onWin])

  function place(updates: Partial<Record<Guest, number | null>>) {
    setSeatOf(prev => ({ ...prev, ...updates }))
    setSelected(null)
    setResult(null)
  }

  function tapSeat(seat: number) {
    if (solved) return
    const here = occupant(seat)
    if (selected?.kind === 'guest') {
      place({ [selected.guest]: seat, ...(here && here !== selected.guest ? { [here]: null } : {}) })
    } else if (selected?.kind === 'seat') {
      if (selected.seat === seat) return setSelected(null)
      const moving = occupant(selected.seat)
      place({ ...(moving ? { [moving]: seat } : {}), ...(here ? { [here]: selected.seat } : {}) })
    } else if (here) {
      setSelected({ kind: 'seat', seat })
    }
  }

  function tapGuest(guest: Guest) {
    if (solved) return
    setSelected(s => (s?.kind === 'guest' && s.guest === guest ? null : { kind: 'guest', guest }))
  }

  function returnToPool() {
    if (selected?.kind !== 'seat') return
    const g = occupant(selected.seat)
    if (g) place({ [g]: null })
  }

  function check() {
    const seating = seatOf as Record<Guest, number>
    const failing = SEATING_CLUES.filter(c => !c.holds(seating)).length
    setResult({ failing })
    if (failing > 0) onMistake()
  }

  const seatButton = (seat: number) => {
    const g = occupant(seat)
    const isSelected = selected?.kind === 'seat' && selected.seat === seat
    const awaiting = selected !== null && !isSelected
    return (
      <button
        key={seat}
        onClick={() => tapSeat(seat)}
        aria-label={g ? `Puesto ocupado por ${GUEST_LABEL[g]}` : 'Puesto vacío'}
        className={cn(
          'flex min-h-[3.5rem] items-center justify-center rounded-md border-2 px-1 text-center text-xs font-medium leading-tight transition-colors',
          g ? 'border-primary bg-white text-primary' : 'border-dashed border-accent/50 bg-white/60 text-muted',
          isSelected && 'border-primary bg-primary text-white',
          awaiting && !g && 'border-accent bg-accent/10',
          solved && 'border-primary bg-primary text-white',
        )}
      >
        {g ? GUEST_LABEL[g] : 'Libre'}
      </button>
    )
  }

  return (
    <div className="select-none">
      <ol className="space-y-2 text-sm text-ink">
        {SEATING_CLUES.map((c, i) => (
          <li key={c.text} className="flex gap-2">
            <span className="w-4 shrink-0 font-heading text-base lining-nums text-accent">{i + 1}.</span>
            <span>{c.text}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted">Pista de baile</p>
        <div className="mt-2 flex items-stretch gap-2">
          <div className="flex w-6 shrink-0 items-center justify-center rounded-md bg-primary">
            <span className="rotate-180 text-[9px] uppercase tracking-[0.2em] text-white [writing-mode:vertical-rl]">
              Mesa de los novios
            </span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-3 gap-2">{SEATS.slice(0, 3).map(seatButton)}</div>
            <div className="flex h-8 items-center justify-center rounded-md bg-secondary text-[10px] uppercase tracking-[0.3em] text-muted">
              Mesa
            </div>
            <div className="grid grid-cols-3 gap-2">{SEATS.slice(3).map(seatButton)}</div>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.3em] text-muted">Jardín</p>
      </div>

      <div
        onClick={returnToPool}
        className={cn(
          'mt-6 min-h-[3rem] rounded-md border border-dashed p-2 transition-colors',
          selected?.kind === 'seat' ? 'border-accent bg-accent/10' : 'border-secondary',
        )}
      >
        {unseated.length === 0 ? (
          <p className="py-2 text-center text-xs text-muted">
            {selected?.kind === 'seat' ? 'Toca aquí para levantar a esta persona' : 'Todos sentados'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unseated.map(g => (
              <button
                key={g}
                onClick={e => { e.stopPropagation(); tapGuest(g) }}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  selected?.kind === 'guest' && selected.guest === g
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary/30 bg-white text-primary hover:border-primary',
                )}
              >
                {GUEST_LABEL[g]}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 h-5 text-center text-sm text-muted" aria-live="polite">
        {solved
          ? '¡Mesa perfecta!'
          : result
            ? `${result.failing} ${result.failing === 1 ? 'pista no se cumple' : 'pistas no se cumplen'}.`
            : selected?.kind === 'guest'
              ? `Elige un puesto para ${GUEST_LABEL[selected.guest].toLowerCase()}.`
              : ''}
      </p>

      <button
        onClick={check}
        disabled={unseated.length > 0 || solved || result !== null}
        className="mt-3 w-full rounded-sm bg-primary py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/90 disabled:opacity-40"
      >
        Comprobar
      </button>
    </div>
  )
}
