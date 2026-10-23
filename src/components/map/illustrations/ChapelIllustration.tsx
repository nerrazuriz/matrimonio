type Props = { className?: string }

export default function ChapelIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 400 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ilustración de la Capilla Nuestra Señora de la Esperanza"
    >
      <defs>
        <pattern id="chapel-hatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#5c3a1e" strokeWidth="0.5" opacity="0.4" />
        </pattern>
        <linearGradient id="chapel-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5e6c8" />
          <stop offset="100%" stopColor="#e8d3a8" />
        </linearGradient>
      </defs>

      {/* Sky / parchment */}
      <rect width="400" height="320" fill="url(#chapel-sky)" />

      {/* Distant mountains */}
      <g stroke="#5c3a1e" strokeWidth="1.2" fill="none">
        <path d="M 0,180 L 60,120 L 110,160 L 170,90 L 230,150 L 300,110 L 360,150 L 400,130 L 400,200 L 0,200 Z" fill="#d4b88a" opacity="0.5" />
        {/* Snow caps */}
        <path d="M 160,100 L 170,90 L 180,100 L 175,105 L 170,100 L 165,105 Z" fill="#fff" opacity="0.85" stroke="none" />
        <path d="M 295,115 L 300,110 L 305,115 L 302,118 L 298,118 Z" fill="#fff" opacity="0.85" stroke="none" />
      </g>

      {/* Mid hills */}
      <path d="M 0,230 Q 80,200 160,225 T 320,220 T 400,235 L 400,320 L 0,320 Z" fill="#c9a36a" opacity="0.5" stroke="#5c3a1e" strokeWidth="1" />

      {/* Hill base for chapel */}
      <path d="M 100,290 Q 200,230 300,290 Z" fill="#b8884a" opacity="0.6" stroke="#5c3a1e" strokeWidth="1.2" />

      {/* Steps */}
      <g stroke="#3d2817" strokeWidth="1" fill="#e8d3a8">
        <rect x="155" y="265" width="90" height="4" />
        <rect x="160" y="259" width="80" height="4" />
        <rect x="165" y="253" width="70" height="4" />
        <rect x="170" y="247" width="60" height="4" />
      </g>

      {/* Chapel body */}
      <g stroke="#3d2817" strokeWidth="1.5" fill="#e8c977">
        {/* Main building */}
        <rect x="170" y="170" width="60" height="78" />
        {/* Side annex (long building) */}
        <rect x="225" y="200" width="80" height="48" />
        {/* Roof of annex */}
        <path d="M 225,200 L 235,190 L 315,190 L 305,200 Z" fill="#8b4513" />
      </g>

      {/* Tower */}
      <g stroke="#3d2817" strokeWidth="1.5" fill="#e8c977">
        <rect x="170" y="125" width="60" height="50" />
        {/* Tower top arch */}
        <path d="M 170,125 Q 200,105 230,125 Z" />
        {/* Belfry opening */}
        <path d="M 188,140 Q 200,128 212,140 L 212,160 L 188,160 Z" fill="#3d2817" />
      </g>

      {/* Cross on top */}
      <g stroke="#3d2817" strokeWidth="2" fill="#3d2817">
        <line x1="200" y1="95" x2="200" y2="118" />
        <line x1="192" y1="102" x2="208" y2="102" />
      </g>

      {/* Door */}
      <g stroke="#3d2817" strokeWidth="1.5" fill="#5c3a1e">
        <path d="M 188,225 Q 188,210 200,210 Q 212,210 212,225 L 212,248 L 188,248 Z" />
        <line x1="200" y1="210" x2="200" y2="248" stroke="#3d2817" strokeWidth="0.8" />
      </g>

      {/* Window niche above door (Virgin Mary) */}
      <ellipse cx="200" cy="195" rx="6" ry="9" fill="#5c3a1e" stroke="#3d2817" />

      {/* Shadow texture on building */}
      <rect x="170" y="170" width="60" height="78" fill="url(#chapel-hatch)" opacity="0.3" />
      <rect x="170" y="125" width="60" height="50" fill="url(#chapel-hatch)" opacity="0.3" />

      {/* Small trees / shrubs at base */}
      <g fill="#5c3a1e" opacity="0.7">
        <circle cx="115" cy="285" r="6" />
        <circle cx="125" cy="280" r="5" />
        <circle cx="285" cy="285" r="6" />
        <circle cx="295" cy="282" r="5" />
      </g>

      {/* Sun rays decoration */}
      <g stroke="#8b6f47" strokeWidth="0.8" opacity="0.6">
        <circle cx="340" cy="50" r="14" fill="none" />
        <g strokeWidth="1">
          <line x1="340" y1="28" x2="340" y2="34" />
          <line x1="340" y1="66" x2="340" y2="72" />
          <line x1="318" y1="50" x2="324" y2="50" />
          <line x1="356" y1="50" x2="362" y2="50" />
          <line x1="324" y1="34" x2="328" y2="38" />
          <line x1="352" y1="62" x2="356" y2="66" />
          <line x1="356" y1="34" x2="352" y2="38" />
          <line x1="328" y1="62" x2="324" y2="66" />
        </g>
      </g>
    </svg>
  )
}
