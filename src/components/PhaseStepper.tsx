import { Check } from 'lucide-react'

export type Phase = 'before' | 'day' | 'after'

const PHASES: { id: Phase; label: string; sublabel: string }[] = [
  { id: 'before', label: 'Antes', sublabel: 'de la ceremonia' },
  { id: 'day',    label: 'Día',   sublabel: 'de la ceremonia' },
  { id: 'after',  label: 'Después', sublabel: 'de la ceremonia' },
]

const WEDDING_DATE = new Date('2026-12-11T18:00:00')
const AFTER_DATE   = new Date('2026-12-12T06:00:00')

function getCurrentPhase(): Phase {
  const now = new Date()
  if (now >= AFTER_DATE) return 'after'
  if (now >= WEDDING_DATE) return 'day'
  return 'before'
}

export default function PhaseStepper({ phase }: { phase?: Phase }) {
  const current = phase ?? getCurrentPhase()
  const currentIndex = PHASES.findIndex(p => p.id === current)

  return (
    <nav className="w-full bg-background px-4 py-3">
      <ol className="mx-auto flex max-w-lg items-center justify-between">
        {PHASES.map((step, i) => {
          const done   = i < currentIndex
          const active = i === currentIndex

          return (
            <li key={step.id} className="flex flex-1 items-center">
              {/* connector line before (skip for first) */}
              {i > 0 && (
                <div
                  className={`h-px flex-1 transition-colors ${
                    done ? 'bg-accent' : 'bg-secondary'
                  }`}
                />
              )}

              <div className="flex flex-col items-center gap-1">
                {/* circle */}
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                    done
                      ? 'border-accent bg-accent text-white'
                      : active
                      ? 'border-primary bg-primary text-white'
                      : 'border-secondary bg-white text-muted'
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>

                {/* label */}
                <div className="flex flex-col items-center leading-tight">
                  <span
                    className={`text-xs font-semibold ${
                      active ? 'text-primary' : done ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="hidden text-[10px] text-muted sm:block">
                    {step.sublabel}
                  </span>
                </div>
              </div>

              {/* connector line after (skip for last) */}
              {i < PHASES.length - 1 && (
                <div
                  className={`h-px flex-1 transition-colors ${
                    done || active ? 'bg-accent' : 'bg-secondary'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
