import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { Timer } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatElapsed } from '@/lib/time'

export type GameProps = { onWin: () => void; onMistake: () => void }

export type ChallengeConfig = {
  storageKey: string
  games: { title: string; Component: ComponentType<GameProps> }[]
  lives?: number
  rules?: string[]
  done: { label: string; title: string; text: (elapsed: string | null) => string }
}

type Progress = { index: number; lives: number; startedAt: number | null; finishedAt: number | null }

function fresh(config: ChallengeConfig): Progress {
  return { index: 0, lives: config.lives ?? Infinity, startedAt: config.rules ? null : Date.now(), finishedAt: null }
}

function load(config: ChallengeConfig): Progress {
  try {
    const p = JSON.parse(sessionStorage.getItem(config.storageKey) ?? 'null')
    if (p && typeof p.index === 'number' && p.index >= 0 && p.index <= config.games.length) {
      return { ...fresh(config), ...p, lives: p.lives ?? config.lives ?? Infinity }
    }
  } catch { /* fall through */ }
  return fresh(config)
}

export default function Challenge({ config, onComplete, onEasy }: {
  config: ChallengeConfig
  onComplete: (elapsedMs: number | null) => void
  onEasy: () => void
}) {
  const [progress, setProgressState] = useState<Progress>(() => load(config))
  const [lostLife, setLostLife] = useState(0)

  const setProgress = useCallback((update: (p: Progress) => Progress) => {
    setProgressState(prev => {
      const next = update(prev)
      try {
        sessionStorage.setItem(config.storageKey, JSON.stringify({ ...next, lives: Number.isFinite(next.lives) ? next.lives : null }))
      } catch { /* noop */ }
      return next
    })
  }, [config.storageKey])

  const total = config.games.length
  const done = progress.finishedAt !== null || progress.index === total
  const outOfLives = !done && progress.lives <= 0
  const elapsedMs = progress.startedAt !== null && progress.finishedAt !== null
    ? progress.finishedAt - progress.startedAt
    : null

  const handleWin = useCallback(() => {
    setProgress(p => {
      const index = p.index + 1
      return { ...p, index, finishedAt: index === total ? Date.now() : null }
    })
  }, [setProgress, total])

  const handleMistake = useCallback(() => {
    setProgress(p => ({ ...p, lives: p.lives - 1 }))
    setLostLife(n => n + 1)
  }, [setProgress])

  const restartGames = () => {
    setProgress(p => ({ ...p, index: 0, lives: config.lives ?? Infinity }))
    window.scrollTo({ top: 0 })
  }

  const replay = () => {
    setProgress(() => fresh(config))
    window.scrollTo({ top: 0 })
  }

  const escape = (
    <div className="mt-10 text-center">
      <button onClick={onEasy} className="text-xs text-muted underline hover:text-primary">
        Prefiero el modo fácil
      </button>
    </div>
  )

  if (config.rules && progress.startedAt === null) {
    return (
      <div>
        <h2 className="text-center font-heading text-3xl font-medium text-primary">Reglas</h2>
        <ul className="mt-6 space-y-3">
          {config.rules.map(rule => (
            <li key={rule} className="flex gap-3 rounded-md border border-secondary bg-white px-4 py-3 text-sm text-ink">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {rule}
            </li>
          ))}
        </ul>
        <button
          onClick={() => setProgress(p => ({ ...p, startedAt: Date.now() }))}
          className="mt-8 w-full rounded-sm bg-primary py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/90"
        >
          Comenzar
        </button>
        {escape}
      </div>
    )
  }

  if (done) {
    const elapsed = elapsedMs !== null && config.lives !== undefined ? formatElapsed(elapsedMs) : null
    return (
      <div className="flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{config.done.label}</p>
        <h2 className="mt-3 font-heading text-4xl font-medium italic text-primary">{config.done.title}</h2>
        <p className="mt-3 text-sm text-muted">{config.done.text(elapsed)}</p>
        <button
          onClick={() => onComplete(config.lives !== undefined ? elapsedMs : null)}
          className="mt-8 w-full rounded-sm bg-primary py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/90"
        >
          Ir al formulario
        </button>
        <button onClick={replay} className="mt-4 text-xs text-muted underline hover:text-primary">
          Volver a jugar
        </button>
      </div>
    )
  }

  if (outOfLives) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Sin vidas</p>
        <h2 className="mt-3 font-heading text-4xl font-medium italic text-primary">Casi…</h2>
        <p className="mt-3 text-sm text-muted">
          Perdiste las {config.lives} vidas. Vuelves al primer desafío; el cronómetro sigue corriendo.
        </p>
        <button
          onClick={restartGames}
          className="mt-8 w-full rounded-sm bg-primary py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/90"
        >
          Intentar de nuevo
        </button>
        {escape}
      </div>
    )
  }

  const { title, Component } = config.games[progress.index]!

  return (
    <div>
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center gap-2" aria-hidden="true">
          {config.games.map((g, i) => (
            <span
              key={g.title}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i < progress.index ? 'w-6 bg-accent' : i === progress.index ? 'w-10 bg-primary' : 'w-6 bg-secondary',
              )}
            />
          ))}
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
          Desafío {progress.index + 1} de {total}
        </p>
        <h2 className="mt-1 font-heading text-3xl font-medium text-primary">{title}</h2>

        {config.lives !== undefined && progress.startedAt !== null && (
          <div className="mt-4 flex items-center gap-5 text-xs text-muted">
            <span className="flex items-center gap-1.5" aria-label={`${progress.lives} ${progress.lives === 1 ? 'vida' : 'vidas'}`}>
              Vidas
              {Array.from({ length: config.lives }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full border transition-colors',
                    i < progress.lives ? 'border-primary bg-primary' : 'border-secondary bg-transparent',
                  )}
                />
              ))}
            </span>
            <ElapsedClock startedAt={progress.startedAt} />
          </div>
        )}
        {lostLife > 0 && <LostLifeNotice key={lostLife} />}
      </div>

      <Component key={progress.index} onWin={handleWin} onMistake={handleMistake} />

      {escape}
    </div>
  )
}

function ElapsedClock({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="flex items-center gap-1 tabular-nums">
      <Timer className="h-3.5 w-3.5" />
      {formatElapsed(now - startedAt)}
    </span>
  )
}

function LostLifeNotice() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const id = setTimeout(() => setVisible(false), 1800)
    return () => clearTimeout(id)
  }, [])
  return (
    <p className={cn('mt-2 h-4 text-xs font-medium text-primary transition-opacity', !visible && 'opacity-0')} aria-live="polite">
      Perdiste una vida
    </p>
  )
}
