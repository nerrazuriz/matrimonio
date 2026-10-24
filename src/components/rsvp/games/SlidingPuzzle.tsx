import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import photo from '@/assets/novios.jpg'
import { cn } from '@/lib/cn'

const SIZE = 3
const EMPTY = SIZE * SIZE - 1
const SHUFFLE_MOVES = 60
const SWIPE_MIN_PX = 24
const ARROWS: Record<string, [number, number] | undefined> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

const neighbors = (pos: number) => {
  const r = Math.floor(pos / SIZE), c = pos % SIZE
  return [
    r > 0 && pos - SIZE,
    r < SIZE - 1 && pos + SIZE,
    c > 0 && pos - 1,
    c < SIZE - 1 && pos + 1,
  ].filter((p): p is number => p !== false)
}

const isSolved = (board: number[]) => board.every((tile, pos) => tile === pos)

function swap(board: number[], a: number, b: number) {
  const tile = board[a]!
  board[a] = board[b]!
  board[b] = tile
}

// Random walk of the empty slot from the solved state, so the result is always solvable.
function shuffle(): number[] {
  const board = Array.from({ length: SIZE * SIZE }, (_, i) => i)
  let empty = EMPTY
  let previous = -1
  for (let i = 0; i < SHUFFLE_MOVES || isSolved(board); i++) {
    const options = neighbors(empty).filter(p => p !== previous)
    const next = options[Math.floor(Math.random() * options.length)]!
    swap(board, empty, next)
    previous = empty
    empty = next
  }
  return board
}

export default function SlidingPuzzle({ onWin }: { onWin: () => void }) {
  const [board, setBoard] = useState(shuffle)
  const [moves, setMoves] = useState(0)
  const [peek, setPeek] = useState(false)
  const solved = isSolved(board)

  useEffect(() => {
    if (!solved) return
    const id = setTimeout(onWin, 1600)
    return () => clearTimeout(id)
  }, [solved, onWin])

  function move(pos: number) {
    if (solved) return
    const empty = board.indexOf(EMPTY)
    if (!neighbors(empty).includes(pos)) return
    const next = [...board]
    swap(next, empty, pos)
    setBoard(next)
    setMoves(m => m + 1)
  }

  // Slides the tile next to the empty slot in direction (dx, dy), i.e. the tile on the opposite side.
  function slide(dx: number, dy: number) {
    const empty = board.indexOf(EMPTY)
    const row = Math.floor(empty / SIZE) - dy, col = (empty % SIZE) - dx
    if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) move(row * SIZE + col)
  }

  const slideRef = useRef(slide)
  slideRef.current = slide
  const gestureRef = useRef<{ id: number; x: number; y: number } | null>(null)
  const swipedRef = useRef(false)

  useEffect(() => {
    if (solved) return
    const onPointerUp = (e: PointerEvent) => {
      const g = gestureRef.current
      if (!g || g.id !== e.pointerId) return
      gestureRef.current = null
      const dx = e.clientX - g.x, dy = e.clientY - g.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return
      swipedRef.current = true
      if (Math.abs(dx) > Math.abs(dy)) slideRef.current(Math.sign(dx), 0)
      else slideRef.current(0, Math.sign(dy))
    }
    const onPointerCancel = () => { gestureRef.current = null }
    const onKeyDown = (e: KeyboardEvent) => {
      const dir = ARROWS[e.key]
      if (!dir) return
      e.preventDefault()
      slideRef.current(dir[0], dir[1])
    }
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [solved])

  function handlePointerDown(e: React.PointerEvent) {
    if (!e.isPrimary) return
    swipedRef.current = false
    gestureRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
  }

  function handleTileClick(pos: number) {
    // A swipe that ends on a tile also fires a click; the swipe already moved a piece.
    if (swipedRef.current) {
      swipedRef.current = false
      return
    }
    move(pos)
  }

  return (
    <div className="flex touch-none select-none flex-col items-center" onPointerDown={handlePointerDown}>
      <p className="text-center text-sm text-muted">
        Toca o desliza una pieza hacia el espacio vacío para armar la foto.
      </p>

      <div className="relative mt-6 aspect-square w-full max-w-sm overflow-hidden rounded-md border border-secondary bg-secondary/50">
        {board.map((tile, pos) => {
          if (tile === EMPTY && !solved) return null
          const row = Math.floor(pos / SIZE), col = pos % SIZE
          return (
            <button
              key={tile}
              onClick={() => handleTileClick(pos)}
              aria-label={`Pieza ${tile + 1}`}
              className="absolute left-0 top-0 h-1/3 w-1/3 p-[1.5px] motion-safe:transition-transform motion-safe:duration-150"
              style={{ transform: `translate(${col * 100}%, ${row * 100}%)` }}
            >
              <span
                className={cn(
                  'block h-full w-full bg-no-repeat',
                  solved ? 'rounded-none' : 'rounded-sm',
                  tile === EMPTY && 'motion-safe:animate-fade-in',
                )}
                style={{
                  backgroundImage: `url(${photo})`,
                  backgroundSize: `${SIZE * 100}% ${SIZE * 100}%`,
                  backgroundPosition: `${(tile % SIZE) * 50}% ${Math.floor(tile / SIZE) * 50}%`,
                }}
              />
            </button>
          )
        })}

        {peek && !solved && (
          <img src={photo} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        )}
      </div>

      <div className="mt-4 flex w-full max-w-sm items-center justify-between text-xs text-muted">
        <span className="uppercase tracking-[0.2em]">{moves} movimientos</span>
        {!solved && (
          <button
            onClick={() => setPeek(p => !p)}
            className="inline-flex items-center gap-1.5 underline-offset-2 hover:text-primary hover:underline"
          >
            {peek ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {peek ? 'Ocultar foto' : 'Ver foto'}
          </button>
        )}
      </div>

      {solved && (
        <p className="mt-6 font-heading text-2xl italic text-primary">¡Puzzle completo!</p>
      )}
    </div>
  )
}
