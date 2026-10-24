import { useEffect, useId, useRef, useState } from 'react'
import photo from '@/assets/novios.jpg'
import { cn } from '@/lib/cn'

const TRAIL: [number, number][] = [
  [48, 172], [80, 146], [110, 120], [138, 94], [164, 62], [188, 34],
]
const STEPS = TRAIL.length - 1
const ASSIST_AFTER_MISSES = 3
const LOCK_MS = 450
// Half the marker's width as a fraction of the bar, so touching the zone edge counts.
const EDGE_TOLERANCE = 0.01

const AVATAR_R = 19
// Crop of the 640×641 photo that frames both faces.
const CROP = { cx: 352, cy: 222, size: 320, width: 640, height: 641 }
const CROP_SCALE = (AVATAR_R * 2) / CROP.size

const speedFor = (step: number) => 0.7 + step * 0.2
const zoneFor = (step: number, misses: number) =>
  Math.max(0.14, 0.26 - step * 0.03) + (misses >= ASSIST_AFTER_MISSES ? 0.05 : 0)

// Triangle wave in [0, 1]: one full sweep across the bar every 1/speed seconds.
const markerAt = (elapsedMs: number, speed: number) => {
  const t = ((Math.max(0, elapsedMs) / 1000) * speed) % 2
  return 1 - Math.abs(t - 1)
}

const isInZone =(p: number, zone: number) => Math.abs(p - 0.5) <= zone / 2 + EDGE_TOLERANCE

type Feedback = 'hit' | 'miss' | null

export default function ClimbGame({ onWin }: { onWin: () => void }) {
  const [step, setStep] = useState(0)
  const [misses, setMisses] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const clipId = `climber-${useId().replace(/[^\w-]/g, '')}`

  const markerRef = useRef<HTMLDivElement>(null)
  const zoneRef = useRef<HTMLDivElement>(null)
  const posRef = useRef(0)
  const startRef = useRef(performance.now())
  const lockUntilRef = useRef(0)

  const won = step === STEPS
  const zone = zoneFor(step, misses)
  const speedRef = useRef(speedFor(step))
  const zoneWidthRef = useRef(zone)
  speedRef.current = speedFor(step)
  zoneWidthRef.current = zone

  useEffect(() => {
    if (won) return
    let frame = 0
    const tick = () => {
      const now = performance.now()
      if (now >= lockUntilRef.current) {
        posRef.current = markerAt(now - startRef.current, speedRef.current)
      }
      if (markerRef.current) markerRef.current.style.left = `${posRef.current * 100}%`
      if (zoneRef.current) {
        zoneRef.current.dataset.inside = String(isInZone(posRef.current, zoneWidthRef.current))
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [won])

  useEffect(() => {
    if (!won) return
    const id = setTimeout(onWin, 1400)
    return () => clearTimeout(id)
  }, [won, onWin])

  function handleTap() {
    const now = performance.now()
    if (won || now < lockUntilRef.current) return

    // Judge against the position the player is actually seeing.
    const hit = isInZone(posRef.current, zoneWidthRef.current)
    lockUntilRef.current = now + LOCK_MS
    startRef.current = now + LOCK_MS

    if (hit) {
      setStep(s => Math.min(STEPS, s + 1))
    } else {
      setStep(s => Math.max(0, s - 1))
      setMisses(m => m + 1)
    }
    setFeedback(hit ? 'hit' : 'miss')
  }

  const [cx, cy] = TRAIL[step]!

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 200" className="w-full max-w-sm overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <circle r={AVATAR_R} />
          </clipPath>
        </defs>
        <polygon
          points="0,200 0,186 48,172 80,146 110,120 138,94 164,62 188,26 218,64 250,100 300,136 300,200"
          className="fill-secondary"
        />
        <polyline
          points={TRAIL.map(p => p.join(',')).join(' ')}
          className="fill-none stroke-accent/50"
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
        {TRAIL.slice(1, -1).map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" className="fill-accent/60" />
        ))}
        <g transform="translate(188 26)">
          <line x1="0" y1="0" x2="0" y2="-18" className="stroke-primary" strokeWidth="1.5" />
          <path d="M0 -18 L12 -14 L0 -10 Z" className={won ? 'fill-accent' : 'fill-primary'} />
        </g>
        <g
          style={{ transform: `translate(${cx}px, ${cy - AVATAR_R + 4}px)` }}
          className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out"
        >
          <circle r={AVATAR_R + 2} className="fill-white" />
          <image
            href={photo}
            clipPath={`url(#${clipId})`}
            x={-CROP.cx * CROP_SCALE}
            y={-CROP.cy * CROP_SCALE}
            width={CROP.width * CROP_SCALE}
            height={CROP.height * CROP_SCALE}
            preserveAspectRatio="none"
          />
          <circle
            r={AVATAR_R + 1}
            className={cn(
              'fill-none transition-colors',
              feedback === 'miss' ? 'stroke-muted' : 'stroke-primary',
            )}
            strokeWidth="2"
          />
        </g>
      </svg>

      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">
        {won ? 'Cumbre' : `Tramo ${step + 1} de ${STEPS}`}
      </p>

      {won ? (
        <p className="mt-6 font-heading text-2xl italic text-primary">¡Llegaron a la cumbre!</p>
      ) : (
        <>
          <div className="relative mt-6 h-10 w-full max-w-sm overflow-hidden rounded-md border border-secondary bg-white">
            <div
              ref={zoneRef}
              data-inside="false"
              className="absolute inset-y-0 bg-accent/25 transition-colors duration-75 data-[inside=true]:bg-accent/50"
              style={{ left: `${(0.5 - zone / 2) * 100}%`, width: `${zone * 100}%` }}
            />
            <div
              ref={markerRef}
              className={cn(
                'absolute inset-y-1 w-1 -translate-x-1/2 rounded-full',
                feedback === 'miss' ? 'bg-muted' : 'bg-primary',
              )}
            />
          </div>

          <button
            onPointerDown={e => { if (e.button === 0) handleTap() }}
            onClick={e => { if (e.detail === 0) handleTap() }}
            className="mt-6 w-full max-w-sm touch-manipulation select-none rounded-sm bg-primary py-4 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors active:bg-primary/80"
          >
            ¡Subir!
          </button>

          <p className="mt-4 h-5 text-sm text-muted" aria-live="polite">
            {feedback === 'hit' && '¡Bien! Sigan subiendo.'}
            {feedback === 'miss' && 'Resbalaron, vuelve a intentarlo.'}
          </p>
          {misses >= ASSIST_AFTER_MISSES && (
            <p className="mt-1 text-xs text-muted">Tip: toca justo cuando la línea esté dentro de la franja.</p>
          )}
        </>
      )}
    </div>
  )
}
