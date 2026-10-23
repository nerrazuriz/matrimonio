import { useEffect } from 'react'
import { X, MapPin } from 'lucide-react'
import ChapelIllustration from './illustrations/ChapelIllustration'
import HaciendaIllustration from './illustrations/HaciendaIllustration'

export type Place = {
  id: 'chapel' | 'hacienda'
  name: string
  subtitle: string
  illustration: 'chapel' | 'hacienda'
  description: string
  facts: { label: string; value: string }[]
  mapsUrl?: string
}

const MAPS_URLS: Record<Place['id'], string> = {
  chapel:
    'https://www.google.com/maps/search/?api=1&query=Capilla+Nuestra+Se%C3%B1ora+de+la+Esperanza+San+Alberto+Hurtado',
  hacienda:
    'https://www.google.com/maps/search/?api=1&query=Hacienda+Porvenir+centro+de+eventos',
}

export default function PlaceInfographic({
  place,
  onClose,
}: {
  place: Place
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const Illustration =
    place.illustration === 'chapel' ? ChapelIllustration : HaciendaIllustration

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="infographic-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d2817]/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-4 border-double border-[#5c3a1e] bg-[#f5e6c8] shadow-2xl"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(139,69,19,0.05), transparent 40%), radial-gradient(circle at 80% 70%, rgba(139,69,19,0.05), transparent 40%)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#5c3a1e] bg-[#f5e6c8] text-[#3d2817] transition-colors hover:bg-[#e8d3a8]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Ornamental top divider */}
        <div className="flex items-center gap-3 px-8 pt-8">
          <div className="h-px flex-1 bg-[#5c3a1e]/60" />
          <span className="font-medieval text-xs tracking-[0.3em] text-[#5c3a1e]">
            ⋆ CRÓNICA ⋆
          </span>
          <div className="h-px flex-1 bg-[#5c3a1e]/60" />
        </div>

        {/* Title */}
        <div className="px-8 pt-3 text-center">
          <h2
            id="infographic-title"
            className="font-medieval text-2xl font-bold tracking-wide text-[#3d2817] sm:text-3xl"
          >
            {place.name}
          </h2>
          <p className="mt-1 font-scroll text-sm italic text-[#5c3a1e]">
            {place.subtitle}
          </p>
        </div>

        {/* Illustration */}
        <div className="mx-8 mt-5 overflow-hidden rounded-lg border-2 border-[#8b6f47] bg-[#e8d3a8]">
          <Illustration className="block w-full h-auto" />
        </div>

        {/* Description */}
        <div className="px-8 py-5">
          <p className="font-scroll text-base leading-relaxed text-[#3d2817] sm:text-lg">
            {place.description}
          </p>
        </div>

        {/* Facts table */}
        <div className="mx-8 mb-6 rounded-lg border border-[#8b6f47] bg-[#e8d3a8]/50">
          <ul className="divide-y divide-[#8b6f47]/40">
            {place.facts.map((f) => (
              <li
                key={f.label}
                className="flex items-baseline justify-between gap-3 px-4 py-2.5"
              >
                <span className="font-medieval text-xs uppercase tracking-wider text-[#5c3a1e]">
                  {f.label}
                </span>
                <span className="text-right font-scroll text-sm text-[#3d2817]">
                  {f.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Map link */}
        <div className="px-8 pb-8">
          <a
            href={MAPS_URLS[place.id]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#5c3a1e] bg-[#3d2817] py-3 font-medieval text-xs uppercase tracking-widest text-[#f5e6c8] transition-colors hover:bg-[#5c3a1e]"
          >
            <MapPin className="h-4 w-4" />
            Cómo llegar
          </a>
        </div>

        {/* Ornamental bottom */}
        <div className="flex items-center gap-3 px-8 pb-6">
          <div className="h-px flex-1 bg-[#5c3a1e]/60" />
          <span className="text-[#5c3a1e]">❦</span>
          <div className="h-px flex-1 bg-[#5c3a1e]/60" />
        </div>
      </div>
    </div>
  )
}
