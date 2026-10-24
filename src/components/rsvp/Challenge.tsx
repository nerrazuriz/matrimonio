import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { cn } from '@/lib/cn'

export type GameProps = { onWin: () => void }

export type ChallengeConfig = {
  storageKey: string
  games: { title: string; Component: ComponentType<GameProps> }[]
  done: { label: string; title: string; text: string }
}

function load(config: ChallengeConfig): number {
  try {
    const n = Number(JSON.parse(sessionStorage.getItem(config.storageKey) ?? '0'))
    return Number.isInteger(n) && n >= 0 && n <= config.games.length ? n : 0
  } catch {
    return 0
  }
}

export default function Challenge({ config, onComplete, onEasy }: {
  config: ChallengeConfig
  onComplete: () => void
  onEasy: () => void
}) {
  const [index, setIndex] = useState(() => load(config))
  const total = config.games.length

  useEffect(() => {
    try { sessionStorage.setItem(config.storageKey, String(index)) } catch { /* noop */ }
  }, [config.storageKey, index])

  const handleWin = useCallback(() => setIndex(i => i + 1), [])

  const replay = () => {
    setIndex(0)
    window.scrollTo({ top: 0 })
  }

  if (index === total) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{config.done.label}</p>
        <h2 className="mt-3 font-heading text-4xl font-medium italic text-primary">{config.done.title}</h2>
        <p className="mt-3 text-sm text-muted">{config.done.text}</p>
        <button
          onClick={onComplete}
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

  const { title, Component } = config.games[index]!

  return (
    <div>
      <div className="mb-6 flex flex-col items-center">
        <div className="flex items-center gap-2" aria-hidden="true">
          {config.games.map((g, i) => (
            <span
              key={g.title}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i < index ? 'w-6 bg-accent' : i === index ? 'w-10 bg-primary' : 'w-6 bg-secondary',
              )}
            />
          ))}
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
          Desafío {index + 1} de {total}
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
