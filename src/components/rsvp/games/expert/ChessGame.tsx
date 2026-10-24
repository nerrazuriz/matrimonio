import { useEffect, useState } from 'react'
import { CHESS_START, CHESS_STEPS } from '@/data/expert'
import type { GameProps } from '../../Challenge'
import { cn } from '@/lib/cn'

const FILES = 'abcdefgh'
// Solid glyphs for both colors (styled per side); U+FE0E forces text rendering instead of emoji.
const GLYPH: Record<string, string> = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
const REPLY_DELAY_MS = 700

// FEN piece placement -> map of square name ("e4") to piece letter (uppercase = white)
function parse(placement: string): Record<string, string> {
  const board: Record<string, string> = {}
  placement.split('/').forEach((row, i) => {
    let file = 0
    for (const ch of row) {
      if (/\d/.test(ch)) file += Number(ch)
      else board[`${FILES[file++]}${8 - i}`] = ch
    }
  })
  return board
}

type Phase = 'player' | 'reply' | 'mate'

export default function ChessGame({ onWin, onMistake }: GameProps) {
  const [step, setStep] = useState(0)
  const [placement, setPlacement] = useState(CHESS_START)
  const [phase, setPhase] = useState<Phase>('player')
  const [selected, setSelected] = useState<string | null>(null)
  const [lastMove, setLastMove] = useState<[string, string] | null>(null)
  const [wrong, setWrong] = useState<string | null>(null)

  const board = parse(placement)

  useEffect(() => {
    if (phase !== 'reply') return
    const reply = CHESS_STEPS[step]!.reply!
    const id = setTimeout(() => {
      setPlacement(reply.after)
      setLastMove([reply.move.slice(0, 2), reply.move.slice(2, 4)])
      setStep(s => s + 1)
      setPhase('player')
    }, REPLY_DELAY_MS)
    return () => clearTimeout(id)
  }, [phase, step])

  useEffect(() => {
    if (phase !== 'mate') return
    const id = setTimeout(onWin, 1600)
    return () => clearTimeout(id)
  }, [phase, onWin])

  function tap(square: string) {
    if (phase !== 'player') return
    const piece = board[square]
    const isWhite = !!piece && piece === piece.toUpperCase()

    if (isWhite) {
      setSelected(s => (s === square ? null : square))
      setWrong(null)
      return
    }
    if (!selected) return

    const expected = CHESS_STEPS[step]!
    setSelected(null)
    if (selected + square !== expected.move) {
      setWrong(square)
      onMistake()
      return
    }
    setWrong(null)
    setPlacement(expected.after)
    setLastMove([selected, square])
    setPhase(expected.reply ? 'reply' : 'mate')
  }

  const status =
    phase === 'mate' ? '¡Jaque mate!'
      : phase === 'reply' ? 'Las negras responden…'
        : wrong ? 'Esa no es la jugada.'
          : `Tu jugada · ${step + 1} de ${CHESS_STEPS.length}`

  return (
    <div className="flex select-none flex-col items-center">
      <p className="text-center text-sm text-muted">
        Juegan las blancas. Encuentra el mate en 3 jugadas.
      </p>

      <div className="mt-5 grid w-full max-w-sm grid-cols-8 overflow-hidden rounded-md border border-primary/30">
        {Array.from({ length: 64 }, (_, i) => {
          const rank = 8 - Math.floor(i / 8)
          const file = FILES[i % 8]!
          const square = `${file}${rank}`
          const piece = board[square]
          const dark = (i + Math.floor(i / 8)) % 2 === 1
          const highlighted = lastMove?.includes(square)
          return (
            <button
              key={square}
              onClick={() => tap(square)}
              aria-label={`${square}${piece ? ` ${piece}` : ''}`}
              className={cn(
                'relative flex aspect-square items-center justify-center',
                dark ? 'bg-accent' : 'bg-secondary',
              )}
            >
              {highlighted && <span className="absolute inset-0 bg-primary/25" />}
              {selected === square && <span className="absolute inset-0 ring-4 ring-inset ring-primary" />}
              {wrong === square && <span className="absolute inset-0 bg-ink/40" />}
              {file === 'a' && (
                <span className={cn('absolute left-0.5 top-0 text-[8px] font-medium', dark ? 'text-secondary' : 'text-accent')}>
                  {rank}
                </span>
              )}
              {rank === 1 && (
                <span className={cn('absolute bottom-0 right-0.5 text-[8px] font-medium', dark ? 'text-secondary' : 'text-accent')}>
                  {file}
                </span>
              )}
              {piece && (
                <span
                  className={cn(
                    'relative font-chess text-[min(8.5vw,2.2rem)] leading-none',
                    piece === piece.toUpperCase() ? 'text-white' : 'text-ink',
                  )}
                  style={piece === piece.toUpperCase()
                    ? { WebkitTextStroke: '1px rgb(var(--color-ink))', paintOrder: 'stroke fill' }
                    : undefined}
                >
                  {GLYPH[piece.toLowerCase()]}{'︎'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="mt-4 h-5 text-sm text-muted" aria-live="polite">{status}</p>
    </div>
  )
}
