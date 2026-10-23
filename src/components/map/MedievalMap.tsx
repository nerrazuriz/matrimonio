import { useState } from 'react'
import PlaceInfographic, { type Place } from './PlaceInfographic'

const PLACES: Record<'chapel' | 'hacienda', Place> = {
  chapel: {
    id: 'chapel',
    name: 'Nuestra Señora de la Esperanza',
    subtitle: 'Capilla en el Cerro',
    illustration: 'chapel',
    description:
      'Perteneciente al territorio Parroquial San Alberto Hurtado, esta capilla fue inaugurada el 10 de Noviembre del año 2024. Se alza sobre el cerro, custodiando el valle como un faro de fe y esperanza.',
    facts: [
      { label: 'Inaugurada', value: '10 de Noviembre, 2024' },
      { label: 'Parroquia', value: 'San Alberto Hurtado' },
      { label: 'Función', value: 'Ceremonia religiosa' },
    ],
  },
  hacienda: {
    id: 'hacienda',
    name: 'Hacienda Porvenir',
    subtitle: 'Casona de Campo · 1880',
    illustration: 'hacienda',
    description:
      'Una casa de campo restaurada del año 1880, custodiada por un parque de más de dos hectáreas. Árboles de más de 300 años, un bosque de paltos y un antiguo piano de cola convertido en fuente de agua hacen de este lugar un rincón encantado.',
    facts: [
      { label: 'Año', value: '1880 · restaurada' },
      { label: 'Parque', value: '2 hectáreas · bosque de paltos' },
      { label: 'Joya', value: 'Piano de cola convertido en fuente' },
      { label: 'Función', value: 'Ceremonia civil, cena y fiesta' },
    ],
  },
}

export default function MedievalMap() {
  const [selected, setSelected] = useState<Place | null>(null)

  return (
    <>
      <div className="rounded-2xl border-2 border-[#8b6f47] bg-[#f5e6c8] p-2 shadow-[0_8px_24px_-8px_rgba(92,58,30,0.4)]">
        <div className="relative overflow-hidden rounded-xl border border-[#8b6f47]/60">
          <svg
            viewBox="0 0 800 600"
            xmlns="http://www.w3.org/2000/svg"
            className="block w-full h-auto"
            role="img"
            aria-label="Mapa medieval con los lugares del matrimonio"
          >
            <defs>
              {/* Parchment fill with subtle gradient */}
              <radialGradient id="parchment" cx="0.5" cy="0.5" r="0.7">
                <stop offset="0%" stopColor="#f5e6c8" />
                <stop offset="70%" stopColor="#e8d3a8" />
                <stop offset="100%" stopColor="#c9a36a" />
              </radialGradient>

              {/* Mountain hatch */}
              <pattern id="m-hatch" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="3" stroke="#5c3a1e" strokeWidth="0.4" opacity="0.4" />
              </pattern>

              {/* Old paper noise via tiny circles in a pattern */}
              <pattern id="paper-noise" patternUnits="userSpaceOnUse" width="40" height="40">
                <circle cx="5" cy="8" r="0.6" fill="#5c3a1e" opacity="0.08" />
                <circle cx="22" cy="15" r="0.4" fill="#5c3a1e" opacity="0.1" />
                <circle cx="33" cy="28" r="0.5" fill="#5c3a1e" opacity="0.08" />
                <circle cx="12" cy="32" r="0.4" fill="#5c3a1e" opacity="0.1" />
              </pattern>

              {/* Glow filter for markers */}
              <filter id="marker-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Parchment base */}
            <rect width="800" height="600" fill="url(#parchment)" />
            <rect width="800" height="600" fill="url(#paper-noise)" />

            {/* Aged stains */}
            <g opacity="0.18">
              <ellipse cx="120" cy="80" rx="60" ry="35" fill="#8b4513" />
              <ellipse cx="700" cy="520" rx="80" ry="40" fill="#8b4513" />
              <ellipse cx="650" cy="100" rx="45" ry="25" fill="#5c3a1e" />
              <ellipse cx="80" cy="450" rx="50" ry="30" fill="#8b4513" />
            </g>

            {/* Decorative inner border */}
            <rect
              x="20"
              y="20"
              width="760"
              height="560"
              fill="none"
              stroke="#5c3a1e"
              strokeWidth="2"
            />
            <rect
              x="28"
              y="28"
              width="744"
              height="544"
              fill="none"
              stroke="#5c3a1e"
              strokeWidth="0.8"
            />

            {/* Corner ornaments */}
            {[
              { x: 20, y: 20, rot: 0 },
              { x: 780, y: 20, rot: 90 },
              { x: 780, y: 580, rot: 180 },
              { x: 20, y: 580, rot: 270 },
            ].map((c, i) => (
              <g key={i} transform={`translate(${c.x},${c.y}) rotate(${c.rot})`}>
                <path
                  d="M 0,0 L 30,0 M 0,0 L 0,30 M 8,8 Q 18,8 18,18 M 12,4 Q 22,4 22,14"
                  stroke="#5c3a1e"
                  strokeWidth="1"
                  fill="none"
                />
                <circle cx="6" cy="6" r="2" fill="#5c3a1e" />
              </g>
            ))}

            {/* Title cartouche */}
            <g>
              <path
                d="M 240,55 L 560,55 L 575,75 L 560,95 L 240,95 L 225,75 Z"
                fill="#e8d3a8"
                stroke="#5c3a1e"
                strokeWidth="1.5"
              />
              <text
                x="400"
                y="82"
                textAnchor="middle"
                fontFamily="Cinzel, serif"
                fontSize="20"
                fontWeight="600"
                fill="#3d2817"
                letterSpacing="3"
              >
                LAS TIERRAS DEL MATRIMONIO
              </text>
            </g>

            {/* Mountain range (top, where chapel sits) */}
            <g stroke="#5c3a1e" strokeWidth="1.4" fill="#c9a36a" opacity="0.85">
              <path d="M 380,260 L 440,170 L 480,220 L 540,140 L 590,200 L 640,160 L 700,220 L 740,190 L 760,230 L 760,280 L 380,280 Z" />
            </g>
            <path
              d="M 380,260 L 440,170 L 480,220 L 540,140 L 590,200 L 640,160 L 700,220 L 740,190 L 760,230 L 760,280 L 380,280 Z"
              fill="url(#m-hatch)"
              opacity="0.5"
            />
            {/* Snow caps */}
            <g fill="#fff" opacity="0.85">
              <path d="M 530,150 L 540,140 L 550,150 L 545,156 L 540,150 L 535,156 Z" />
              <path d="M 632,170 L 640,160 L 648,170 L 644,175 L 638,175 Z" />
              <path d="M 433,180 L 440,170 L 448,180 L 444,184 L 437,184 Z" />
            </g>

            {/* Hills (mid) */}
            <path
              d="M 40,360 Q 150,320 280,355 T 500,370 Q 600,340 720,360 L 760,365 L 760,400 L 40,400 Z"
              fill="#b8884a"
              opacity="0.45"
              stroke="#5c3a1e"
              strokeWidth="0.8"
            />

            {/* Forest (lower) */}
            <g fill="#5c8a5c" opacity="0.55" stroke="#3d5a30" strokeWidth="0.8">
              {Array.from({ length: 14 }).map((_, i) => {
                const x = 80 + i * 22
                const y = 470 + (i % 3) * 8
                return (
                  <g key={i} transform={`translate(${x},${y})`}>
                    <path d="M 0,0 L -8,18 L 8,18 Z" />
                    <rect x="-1.5" y="18" width="3" height="6" fill="#5c3a1e" stroke="none" />
                  </g>
                )
              })}
            </g>

            {/* Decorative small trees scattered */}
            <g fill="#7a9a5a" opacity="0.7" stroke="#3d5a30" strokeWidth="0.7">
              <g transform="translate(360,360)"><path d="M 0,0 L -6,12 L 6,12 Z" /><rect x="-1" y="12" width="2" height="4" fill="#5c3a1e" stroke="none" /></g>
              <g transform="translate(430,395)"><path d="M 0,0 L -6,12 L 6,12 Z" /><rect x="-1" y="12" width="2" height="4" fill="#5c3a1e" stroke="none" /></g>
              <g transform="translate(550,400)"><path d="M 0,0 L -7,14 L 7,14 Z" /><rect x="-1" y="14" width="2" height="4" fill="#5c3a1e" stroke="none" /></g>
              <g transform="translate(680,420)"><path d="M 0,0 L -7,14 L 7,14 Z" /><rect x="-1" y="14" width="2" height="4" fill="#5c3a1e" stroke="none" /></g>
              <g transform="translate(120,330)"><path d="M 0,0 L -6,12 L 6,12 Z" /><rect x="-1" y="12" width="2" height="4" fill="#5c3a1e" stroke="none" /></g>
            </g>

            {/* River decorative */}
            <path
              d="M 30,540 Q 100,520 180,535 Q 260,548 340,530 Q 420,515 500,535 Q 580,550 660,530 Q 720,520 770,535"
              fill="none"
              stroke="#5c8aa8"
              strokeWidth="3"
              opacity="0.5"
            />
            <path
              d="M 30,540 Q 100,520 180,535 Q 260,548 340,530 Q 420,515 500,535 Q 580,550 660,530 Q 720,520 770,535"
              fill="none"
              stroke="#fff"
              strokeWidth="0.8"
              opacity="0.6"
            />

            {/* Path from chapel to hacienda — dashed Tolkien style */}
            <path
              d="M 590,220 Q 540,290 480,330 Q 400,380 340,400 Q 280,420 210,440"
              fill="none"
              stroke="#3d2817"
              strokeWidth="3"
              strokeDasharray="2 8"
              strokeLinecap="round"
              opacity="0.75"
            />
            {/* Footprints along path */}
            <g fill="#3d2817" opacity="0.5">
              <ellipse cx="510" cy="305" rx="2" ry="3" transform="rotate(-30 510 305)" />
              <ellipse cx="430" cy="370" rx="2" ry="3" transform="rotate(-20 430 370)" />
              <ellipse cx="350" cy="395" rx="2" ry="3" transform="rotate(-15 350 395)" />
            </g>

            {/* Compass rose */}
            <g transform="translate(110,165)">
              <circle r="42" fill="#f5e6c8" stroke="#5c3a1e" strokeWidth="1.2" opacity="0.95" />
              <circle r="34" fill="none" stroke="#5c3a1e" strokeWidth="0.6" />
              <g fill="#5c3a1e">
                <path d="M 0,-38 L 5,0 L 0,38 L -5,0 Z" opacity="0.9" />
                <path d="M -38,0 L 0,-5 L 38,0 L 0,5 Z" opacity="0.7" />
              </g>
              <g fill="#3d2817" fontFamily="Cinzel, serif" fontSize="10" fontWeight="600" textAnchor="middle">
                <text y="-46">N</text>
                <text y="56">S</text>
                <text x="50" y="4">E</text>
                <text x="-50" y="4">O</text>
              </g>
              <circle r="3" fill="#3d2817" />
            </g>

            {/* === CHAPEL MARKER (clickable) === */}
            <g
              transform="translate(620,200)"
              onClick={() => setSelected(PLACES.chapel)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelected(PLACES.chapel)
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Ver detalle de la Capilla"
              className="transition-transform hover:scale-110 focus:outline-none"
              style={{ cursor: 'pointer', transformOrigin: '620px 200px' }}
            >
              {/* Hill base */}
              <ellipse cx="0" cy="35" rx="55" ry="14" fill="#a87d4a" opacity="0.6" />
              {/* Glow */}
              <circle r="30" fill="#e8c977" opacity="0.3" filter="url(#marker-glow)" />
              {/* Chapel icon */}
              <g stroke="#3d2817" strokeWidth="1.4">
                {/* main building */}
                <rect x="-12" y="-10" width="24" height="35" fill="#e8c977" />
                {/* tower */}
                <rect x="-12" y="-30" width="24" height="22" fill="#e8c977" />
                <path d="M -12,-30 Q 0,-42 12,-30 Z" fill="#e8c977" />
                {/* cross */}
                <line x1="0" y1="-52" x2="0" y2="-42" strokeWidth="2" />
                <line x1="-4" y1="-48" x2="4" y2="-48" strokeWidth="2" />
                {/* door */}
                <path d="M -4,25 L -4,12 Q -4,8 0,8 Q 4,8 4,12 L 4,25 Z" fill="#5c3a1e" />
                {/* belfry */}
                <rect x="-6" y="-25" width="12" height="10" fill="#3d2817" />
              </g>
              {/* Label */}
              <g transform="translate(0,65)">
                <rect
                  x="-78"
                  y="-12"
                  width="156"
                  height="24"
                  fill="#f5e6c8"
                  stroke="#5c3a1e"
                  strokeWidth="0.8"
                  rx="2"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fontFamily='"IM Fell English", serif'
                  fontSize="13"
                  fontStyle="italic"
                  fill="#3d2817"
                >
                  Capilla de la Esperanza
                </text>
              </g>
            </g>

            {/* === HACIENDA MARKER (clickable) === */}
            <g
              transform="translate(200,440)"
              style={{ cursor: 'pointer', transformOrigin: '200px 440px' }}
              onClick={() => setSelected(PLACES.hacienda)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelected(PLACES.hacienda)
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Ver detalle de la Hacienda Porvenir"
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              {/* Glow */}
              <circle r="36" fill="#e8c977" opacity="0.3" filter="url(#marker-glow)" />
              {/* Hacienda icon */}
              <g stroke="#3d2817" strokeWidth="1.4">
                {/* roof */}
                <path d="M -32,-5 L -22,-18 L 22,-18 L 32,-5 Z" fill="#8b4513" />
                {/* body */}
                <rect x="-30" y="-5" width="60" height="28" fill="#e8d3a8" />
                {/* columns */}
                <rect x="-22" y="0" width="2" height="23" fill="#5c3a1e" />
                <rect x="-10" y="0" width="2" height="23" fill="#5c3a1e" />
                <rect x="8" y="0" width="2" height="23" fill="#5c3a1e" />
                <rect x="20" y="0" width="2" height="23" fill="#5c3a1e" />
                {/* door */}
                <path d="M -4,23 L -4,10 Q -4,6 0,6 Q 4,6 4,10 L 4,23 Z" fill="#5c3a1e" />
                {/* small fountain in front */}
                <ellipse cx="0" cy="32" rx="14" ry="3" fill="#5c8aa8" stroke="#3d2817" strokeWidth="0.8" />
              </g>
              {/* trees flanking */}
              <g fill="#5c8a5c" stroke="#3d5a30" strokeWidth="0.6" opacity="0.85">
                <circle cx="-45" cy="0" r="10" />
                <rect x="-46" y="8" width="2" height="6" fill="#5c3a1e" stroke="none" />
                <circle cx="45" cy="0" r="10" />
                <rect x="44" y="8" width="2" height="6" fill="#5c3a1e" stroke="none" />
              </g>
              {/* Label */}
              <g transform="translate(0,60)">
                <rect
                  x="-72"
                  y="-12"
                  width="144"
                  height="24"
                  fill="#f5e6c8"
                  stroke="#5c3a1e"
                  strokeWidth="0.8"
                  rx="2"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fontFamily='"IM Fell English", serif'
                  fontSize="13"
                  fontStyle="italic"
                  fill="#3d2817"
                >
                  Hacienda Porvenir
                </text>
              </g>
            </g>

            {/* Sea creature decoration (bottom right corner) */}
            <g transform="translate(710,560)" stroke="#5c3a1e" strokeWidth="1" fill="none" opacity="0.6">
              <path d="M 0,0 Q -10,-8 -20,-4 Q -14,4 -8,2" />
              <circle cx="-18" cy="-4" r="1" fill="#5c3a1e" />
            </g>

            {/* Hint text at bottom */}
            <text
              x="400"
              y="558"
              textAnchor="middle"
              fontFamily='"IM Fell English", serif'
              fontSize="13"
              fontStyle="italic"
              fill="#5c3a1e"
              opacity="0.85"
            >
              ⊰ Toca un lugar para descubrir su historia ⊱
            </text>
          </svg>
        </div>
      </div>

      {selected && (
        <PlaceInfographic place={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
