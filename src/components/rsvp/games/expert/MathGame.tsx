import { useEffect, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import type { GameProps } from '../../Challenge'
import { cn } from '@/lib/cn'

const ANSWER = 6

const Frac = ({ num, den }: { num: ReactNode; den: ReactNode }) => (
  <span className="mx-0.5 inline-flex flex-col items-center align-middle text-[0.8em] leading-tight">
    <span className="border-b border-current px-1">{num}</span>
    <span className="px-1">{den}</span>
  </span>
)

const BigOp = ({ sym, top, bottom }: { sym: string; top?: ReactNode; bottom?: ReactNode }) => (
  <span className="mx-0.5 inline-flex flex-col items-center align-middle leading-none">
    <span className="h-3 text-[0.55em]">{top}</span>
    <span className="text-[1.5em]">{sym}</span>
    <span className="h-3 text-[0.55em]">{bottom}</span>
  </span>
)

const Lim = ({ under }: { under: ReactNode }) => (
  <span className="mr-1 inline-flex flex-col items-center align-middle leading-none">
    <span>lím</span>
    <span className="mt-1 text-[0.55em]">{under}</span>
  </span>
)

const At = ({ cond }: { cond: ReactNode }) => (
  <span className="ml-0.5 inline-flex items-end align-middle">
    <span className="text-[1.5em] leading-none">|</span>
    <span className="mb-[-0.2em] text-[0.55em]">{cond}</span>
  </span>
)

const v = (s: string) => <i>{s}</i>

// Each option carries its real value; the game treats exactly the ones equal to ANSWER as correct.
const OPTIONS: { id: string; value: number; render: ReactNode }[] = [
  { id: 'euler7', value: Math.cos(Math.PI) + 7, render: <>{v('e')}<sup>{v('i')}π</sup> + 7</> },
  { id: 'log64', value: Math.log2(64), render: <>log<sub>2</sub> 64</> },
  { id: 'deriv3', value: 3 * Math.SQRT2 ** 2, render: <><Frac num="d" den={<>d{v('x')}</>} />({v('x')}<sup>3</sup>)<At cond={<>{v('x')}=√2</>} /></> },
  { id: 'ceilFloor', value: Math.ceil(Math.E) + Math.floor(Math.PI), render: <>⌈{v('e')}⌉ + ⌊π⌋</> },
  { id: 'floorCeil', value: Math.floor(Math.E) + Math.ceil(Math.PI), render: <>⌊{v('e')}⌋ + ⌈π⌉</> },
  { id: 'sum3', value: 1 + 2 + 3, render: <><BigOp sym="∑" top="3" bottom={<>{v('k')}=1</>} />{v('k')}</> },
  { id: 'lim5', value: 5, render: <><Lim under={<>{v('x')}→0</>} /><Frac num={<>sen(5{v('x')})</>} den={v('x')} /></> },
  { id: 'log128', value: Math.log2(128), render: <>log<sub>2</sub> 128</> },
  { id: 'floors', value: Math.floor(Math.E) + Math.floor(Math.PI), render: <>⌊{v('e')}⌋ + ⌊π⌋</> },
  { id: 'ceils', value: Math.ceil(Math.E) + Math.ceil(Math.PI), render: <>⌈{v('e')}⌉ + ⌈π⌉</> },
  { id: 'euler8', value: Math.cos(Math.PI) + 8, render: <>{v('e')}<sup>{v('i')}π</sup> + 8</> },
  { id: 'geo', value: 1 + 2 + 4, render: <><BigOp sym="∑" top="2" bottom={<>{v('k')}=0</>} />2<sup>{v('k')}</sup></> },
  { id: 'deriv2', value: 2 * 4, render: <><Frac num="d" den={<>d{v('x')}</>} />({v('x')}<sup>2</sup>)<At cond={<>{v('x')}=4</>} /></> },
  { id: 'integral', value: 2 ** 2, render: <><BigOp sym="∫" top="2" bottom="0" />2{v('x')} d{v('x')}</> },
  { id: 'i4', value: 1 + 4, render: <>{v('i')}<sup>4</sup> + 4</> },
  { id: 'fact', value: 120 / 24, render: <Frac num="5!" den="4!" /> },
]

const isCorrect = (value: number) => Math.abs(value - ANSWER) < 1e-9
const CORRECT = OPTIONS.filter(o => isCorrect(o.value))
const DECOYS = OPTIONS.filter(o => !isCorrect(o.value))

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

const deal = () => shuffle([...shuffle(CORRECT).slice(0, 1), ...shuffle(DECOYS).slice(0, 3)])

export default function MathGame({ onWin, onMistake }: GameProps) {
  const [options, setOptions] = useState(deal)
  const [solvedId, setSolvedId] = useState<string | null>(null)
  const [missed, setMissed] = useState(false)

  useEffect(() => {
    if (!solvedId) return
    const id = setTimeout(onWin, 1600)
    return () => clearTimeout(id)
  }, [solvedId, onWin])

  function choose(id: string, value: number) {
    if (solvedId) return
    if (isCorrect(value)) {
      setSolvedId(id)
      setMissed(false)
    } else {
      onMistake()
      setMissed(true)
      setOptions(deal())
    }
  }

  return (
    <div>
      <h3 className="text-center font-heading text-3xl font-medium leading-tight text-primary">
        ¿Cuántos años pololearon Nico y Cote?
      </h3>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {options.map(o => (
          <button
            key={o.id}
            onClick={() => choose(o.id, o.value)}
            disabled={solvedId !== null}
            className={cn(
              'relative flex min-h-[5.5rem] items-center justify-center rounded-md border-2 px-2 font-heading text-2xl lining-nums text-primary transition-colors',
              solvedId === o.id ? 'border-primary bg-primary text-white' : 'border-secondary bg-white hover:border-primary',
              solvedId && solvedId !== o.id && 'opacity-40',
            )}
          >
            <span className="whitespace-nowrap">{o.render}</span>
            {solvedId === o.id && <Check className="absolute right-2 top-2 h-4 w-4" />}
          </button>
        ))}
      </div>

      <p className="mt-4 h-5 text-center text-sm text-muted" aria-live="polite">
        {solvedId ? '¡Correcto! Pololearon 6 años.' : missed ? 'Incorrecto. Las opciones cambiaron.' : ''}
      </p>
    </div>
  )
}
