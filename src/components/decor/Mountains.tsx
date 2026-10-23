import { cn } from '@/lib/cn'

export default function Mountains({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={cn('block w-full', className)}
    >
      <path
        className="fill-none stroke-accent/50"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        d="M0 292 C220 284 400 250 540 214 C620 193 680 176 720 176 C760 176 820 193 900 214 C1040 250 1220 284 1440 292"
      />
      <path
        className="fill-accent/10"
        d="M0 400 L0 322 C160 304 300 270 440 276 C600 283 680 310 820 298 C980 284 1080 248 1220 256 C1320 262 1400 284 1440 290 L1440 400 Z"
      />
      <path
        className="fill-accent/20"
        d="M0 400 L0 352 C140 338 260 320 400 328 C560 338 660 352 800 342 C960 330 1060 312 1200 322 C1320 330 1400 344 1440 346 L1440 400 Z"
      />
      <path
        className="fill-primary"
        d="M0 400 L0 380 C160 370 320 364 480 370 C640 376 800 384 960 377 C1120 370 1280 368 1440 375 L1440 400 Z"
      />
    </svg>
  )
}
