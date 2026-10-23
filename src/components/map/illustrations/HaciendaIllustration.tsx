type Props = { className?: string }

export default function HaciendaIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 400 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ilustración de la Hacienda Porvenir"
    >
      <defs>
        <pattern id="hacienda-hatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#5c3a1e" strokeWidth="0.5" opacity="0.4" />
        </pattern>
        <linearGradient id="hacienda-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5e6c8" />
          <stop offset="100%" stopColor="#e8d3a8" />
        </linearGradient>
        <radialGradient id="moon-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff8dc" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff8dc" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect width="400" height="320" fill="url(#hacienda-sky)" />

      {/* Moon */}
      <circle cx="320" cy="55" r="22" fill="url(#moon-glow)" />
      <circle cx="320" cy="55" r="12" fill="#f5e6c8" stroke="#8b6f47" strokeWidth="0.8" />

      {/* Distant trees silhouette */}
      <g fill="#8b6f47" opacity="0.4" stroke="#5c3a1e" strokeWidth="0.6">
        <ellipse cx="40" cy="180" rx="35" ry="40" />
        <ellipse cx="370" cy="175" rx="32" ry="38" />
      </g>

      {/* Large ancient tree on left */}
      <g stroke="#3d2817" strokeWidth="1.4">
        <path d="M 60,250 L 58,180 Q 55,160 65,150 Q 70,158 68,180 L 70,250 Z" fill="#5c3a1e" />
        <circle cx="55" cy="140" r="20" fill="#a89060" />
        <circle cx="75" cy="135" r="22" fill="#a89060" />
        <circle cx="65" cy="120" r="20" fill="#a89060" />
        <circle cx="50" cy="125" r="16" fill="#a89060" />
        <circle cx="80" cy="150" r="18" fill="#a89060" />
        {/* Branch detail */}
        <path d="M 60,180 L 45,165 M 65,170 L 80,158" fill="none" />
      </g>

      {/* Large ancient tree on right */}
      <g stroke="#3d2817" strokeWidth="1.4">
        <path d="M 340,250 L 338,185 Q 335,165 345,155 Q 350,163 348,185 L 350,250 Z" fill="#5c3a1e" />
        <circle cx="335" cy="145" r="20" fill="#a89060" />
        <circle cx="355" cy="140" r="22" fill="#a89060" />
        <circle cx="345" cy="125" r="20" fill="#a89060" />
        <circle cx="330" cy="130" r="16" fill="#a89060" />
        <circle cx="360" cy="155" r="18" fill="#a89060" />
      </g>

      {/* Ground / cobblestone */}
      <path d="M 0,250 L 400,250 L 400,320 L 0,320 Z" fill="#c9a36a" opacity="0.6" stroke="#5c3a1e" strokeWidth="1" />
      <g stroke="#5c3a1e" strokeWidth="0.4" opacity="0.5" fill="none">
        <path d="M 80,265 Q 100,263 120,265 M 130,275 Q 150,273 170,275 M 200,265 Q 220,263 240,265 M 260,278 Q 280,276 300,278" />
      </g>

      {/* Hacienda body — long low building */}
      <g stroke="#3d2817" strokeWidth="1.5">
        {/* Main wall */}
        <rect x="90" y="180" width="220" height="70" fill="#e8d3a8" />
        {/* Roof — tile, sloped */}
        <path d="M 80,180 L 105,160 L 295,160 L 320,180 Z" fill="#8b4513" />
        <path d="M 80,180 L 105,160 L 295,160 L 320,180 Z" fill="url(#hacienda-hatch)" opacity="0.4" />
        {/* Tile lines on roof */}
        <g stroke="#3d2817" strokeWidth="0.6" opacity="0.6">
          <line x1="88" y1="178" x2="110" y2="163" />
          <line x1="312" y1="178" x2="290" y2="163" />
          <line x1="155" y1="178" x2="155" y2="160" />
          <line x1="200" y1="178" x2="200" y2="160" />
          <line x1="245" y1="178" x2="245" y2="160" />
        </g>
      </g>

      {/* Columns / porch */}
      <g stroke="#3d2817" strokeWidth="1" fill="#5c3a1e">
        <rect x="115" y="195" width="4" height="55" />
        <rect x="155" y="195" width="4" height="55" />
        <rect x="195" y="195" width="4" height="55" />
        <rect x="235" y="195" width="4" height="55" />
        <rect x="275" y="195" width="4" height="55" />
      </g>

      {/* Central door */}
      <g stroke="#3d2817" strokeWidth="1.5">
        <path d="M 188,250 L 188,215 Q 188,205 200,205 Q 212,205 212,215 L 212,250 Z" fill="#5c3a1e" />
        <line x1="200" y1="205" x2="200" y2="250" strokeWidth="0.8" />
      </g>

      {/* Windows */}
      <g stroke="#3d2817" strokeWidth="1" fill="#a89060">
        <rect x="125" y="200" width="20" height="22" />
        <rect x="255" y="200" width="20" height="22" />
        <line x1="135" y1="200" x2="135" y2="222" strokeWidth="0.6" />
        <line x1="125" y1="211" x2="145" y2="211" strokeWidth="0.6" />
        <line x1="265" y1="200" x2="265" y2="222" strokeWidth="0.6" />
        <line x1="255" y1="211" x2="275" y2="211" strokeWidth="0.6" />
      </g>

      {/* Wall texture */}
      <rect x="90" y="180" width="220" height="70" fill="url(#hacienda-hatch)" opacity="0.18" />

      {/* Round fountain in front */}
      <g stroke="#3d2817" strokeWidth="1.4">
        <ellipse cx="200" cy="285" rx="50" ry="14" fill="#8b6f47" />
        <ellipse cx="200" cy="282" rx="50" ry="10" fill="#5c8aa8" />
        {/* Water lilies */}
        <circle cx="180" cy="280" r="3" fill="#e8c977" />
        <circle cx="220" cy="284" r="3" fill="#e8c977" />
        <circle cx="200" cy="278" r="2.5" fill="#e8c977" />
        {/* Side bench */}
        <rect x="125" y="278" width="32" height="6" fill="#e8d3a8" />
        <rect x="128" y="284" width="3" height="8" fill="#5c3a1e" />
        <rect x="151" y="284" width="3" height="8" fill="#5c3a1e" />
      </g>

      {/* Flower bed beside bench */}
      <g fill="#c9885a" opacity="0.85">
        <circle cx="130" cy="275" r="2.5" />
        <circle cx="136" cy="273" r="2.5" />
        <circle cx="142" cy="276" r="2.5" />
        <circle cx="148" cy="274" r="2.5" />
        <circle cx="154" cy="276" r="2.5" />
      </g>
    </svg>
  )
}
