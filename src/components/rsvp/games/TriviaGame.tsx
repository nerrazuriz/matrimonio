import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { TRIVIA } from '@/data/trivia'
import { cn } from '@/lib/cn'

export default function TriviaGame({ onWin }: { onWin: () => void }) {
  const [index, setIndex] = useState(0)
  const [wrong, setWrong] = useState<number[]>([])
  const [correct, setCorrect] = useState(false)

  const q = TRIVIA[index]!
  const isLast = index === TRIVIA.length - 1

  useEffect(() => {
    if (!correct) return
    const id = setTimeout(() => {
      if (isLast) {
        onWin()
      } else {
        setIndex(i => i + 1)
        setWrong([])
        setCorrect(false)
      }
    }, 900)
    return () => clearTimeout(id)
  }, [correct, isLast, onWin])

  function choose(i: number) {
    if (correct || wrong.includes(i)) return
    if (i === q.answer) setCorrect(true)
    else setWrong(w => [...w, i])
  }

  return (
    <div>
      <p className="text-center text-xs uppercase tracking-[0.2em] text-muted">
        Pregunta {index + 1} de {TRIVIA.length}
      </p>
      <h3 className="mt-3 text-center font-heading text-3xl font-medium leading-tight text-primary">
        {q.question}
      </h3>

      <div className="mt-8 space-y-3">
        {q.options.map((option, i) => {
          const isWrong = wrong.includes(i)
          const isRight = correct && i === q.answer
          return (
            <button
              key={option}
              onClick={() => choose(i)}
              disabled={isWrong || correct}
              className={cn(
                'flex w-full items-center justify-between rounded-md border-2 px-4 py-3 text-left text-sm font-medium transition-colors',
                isRight && 'border-primary bg-primary text-white',
                isWrong && 'border-secondary bg-secondary/40 text-muted line-through',
                !isRight && !isWrong && 'border-secondary bg-white text-primary hover:border-primary',
              )}
            >
              {option}
              {isRight && <Check className="h-4 w-4 shrink-0" />}
              {isWrong && <X className="h-4 w-4 shrink-0" />}
            </button>
          )
        })}
      </div>

      <p className="mt-4 h-5 text-center text-sm text-muted" aria-live="polite">
        {correct ? '¡Correcto!' : wrong.length > 0 ? 'No es esa, prueba otra.' : ''}
      </p>
    </div>
  )
}
