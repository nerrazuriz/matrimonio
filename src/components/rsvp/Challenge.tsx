import { useCallback, useState } from 'react'
import { cn } from '@/lib/cn'
import ClimbGame from './games/ClimbGame'
import TriviaGame from './games/TriviaGame'
import SlidingPuzzle from './games/SlidingPuzzle'

const GAMES = [
  { title: 'Sube la montaña', Component: ClimbGame },
  { title: 'Trivia de los novios', Component: TriviaGame },
  { title: 'Arma la foto', Component: SlidingPuzzle },
]

export const CHALLENGE_KEY = 'wedding_rsvp_challenge'

function loadProgress(): number {
  try {
    const n = Number(sessionStorage.getItem(CHALLENGE_KEY))
    return Number.isInteger(n) && n >= 0 && n <= GAMES.length ? n : 0
  } catch {
    return 0
  }
}

export default function Challenge({ onComplete, onEasy }: { onComplete: () => void; onEasy: () => void }) {
  const [index, setIndex] = useState(loadProgress)
  const done = index === GAMES.length

  const handleWin = useCallback(() => {
    setIndex(i => {
      const next = i + 1
      try { sessionStorage.setItem(CHALLENGE_KEY, String(next)) } catch { /* noop */ }
      return next
    })
  }, [])

  function handleReplay() {
    try { sessionStorage.removeItem(CHALLENGE_KEY) } catch { /* noop */ }
    setIndex(0)
    window.scrollTo({ top: 0 })
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Modo difícil superado</p>
        <h2 className="mt-3 font-heading text-4xl font-medium italic text-primary">¡Lo lograste!</h2>
        <p className="mt-3 text-sm text-muted">
          Superaste los tres desafíos. Ahora sí, confirma tu asistencia.
        </p>
        <button
          onClick={onComplete}
          className="mt-8 w-full rounded-sm bg-primary py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/90"
        >
          Ir al formulario
        </button>
        <button
          onClick={handleReplay}
          className="mt-4 text-xs text-muted underline hover:text-primary"
        >
          Volver a jugar
        </button>
      </div>
    )
  }

  const { title, Component } = GAMES[index]!

  return (
    <div>
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center gap-2" aria-hidden="true">
          {GAMES.map((g, i) => (
            <span
              key={g.title}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i < index ? 'w-6 bg-accent' : i === index ? 'w-10 bg-primary' : 'w-6 bg-secondary',
              )}
            />
          ))}
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
          Desafío {index + 1} de {GAMES.length}
        </p>
        <h2 className="mt-1 font-heading text-3xl font-medium text-primary">{title}</h2>
      </div>

      <Component key={index} onWin={handleWin} />

      <div className="mt-10 text-center">
        <button onClick={onEasy} className="text-xs text-muted underline hover:text-primary">
          Prefiero el modo fácil
        </button>
      </div>
    </div>
  )
}
