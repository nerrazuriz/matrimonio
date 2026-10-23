import { useCountdown } from '@/hooks/useCountdown'
import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import Mountains from '@/components/decor/Mountains'
import { Divider } from '@/components/decor/Ornaments'

const EVENT_DATE = new Date('2026-12-11T18:00:00')

const COUPLE = {
  name1: 'Nico',
  name2: 'Cote',
  date: 'Viernes 11 de Diciembre · 2026',
  ceremony: 'Iglesia del Colegio Santa Úrsula',
  reception: 'Hacienda Porvenir',
  ceremonyMaps: 'https://maps.app.goo.gl/zQ6oEsjDyaUKuxKj9',
  receptionMaps: 'https://maps.app.goo.gl/CEba1wx8ZH63tkjS6',
}

export default function Home() {
  const countdown = useCountdown(EVENT_DATE)

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative flex min-h-svh flex-col bg-gradient-to-b from-secondary via-background to-background">
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-2 pt-12 text-center">
          <h1 className="font-heading text-6xl font-medium leading-none text-primary sm:text-8xl">
            {COUPLE.name1}
            <span className="mx-3 font-normal italic text-accent sm:mx-5">&</span>
            {COUPLE.name2}
          </h1>

          <Divider className="mt-8" />

          <p className="mt-6 text-xs font-medium uppercase tracking-[0.3em] text-primary/80 sm:text-sm">
            {COUPLE.date}
          </p>
          <p className="mt-2 font-heading text-lg italic text-muted">{COUPLE.ceremony}</p>

          {!countdown.isExpired && (
            <div className="mt-10 flex justify-center divide-x divide-primary/15">
              {([
                { value: countdown.days, label: 'Días' },
                { value: countdown.hours, label: 'Horas' },
                { value: countdown.minutes, label: 'Min' },
                { value: countdown.seconds, label: 'Seg' },
              ] as const).map(({ value, label }) => (
                <div key={label} className="flex w-16 flex-col items-center sm:w-24">
                  <span className="font-heading text-4xl font-medium lining-nums tabular-nums text-primary sm:text-5xl">
                    {String(value).padStart(2, '0')}
                  </span>
                  <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/rsvp"
            className="mt-10 inline-flex items-center rounded-sm bg-primary px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/90"
          >
            Confirmar Asistencia
          </Link>
        </div>

        <Mountains className="h-[26vh] min-h-[170px] max-h-[340px]" />
      </section>

      {/* Details */}
      <section className="seigaiha text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
          <h2 className="text-center font-heading text-4xl italic sm:text-5xl">El Gran Día</h2>
          <Divider light className="mt-6" />

          <div className="mt-14 grid gap-px overflow-hidden rounded-sm bg-white/15 sm:grid-cols-2">
            <EventCard
              label="Ceremonia"
              place={COUPLE.ceremony}
              meta="18:00 hrs"
              mapsUrl={COUPLE.ceremonyMaps}
            />
            <EventCard
              label="Recepción"
              place={COUPLE.reception}
              meta="Comida & Fiesta"
              mapsUrl={COUPLE.receptionMaps}
            />
          </div>

          <div className="mt-16 flex justify-center">
            <Link
              to="/rsvp"
              className="inline-flex items-center rounded-sm border border-white/50 px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-primary"
            >
              Confirmar Asistencia
            </Link>
          </div>
        </div>

        <footer className="border-t border-white/10 bg-primary py-10 text-center">
          <p className="font-heading text-2xl italic text-white/90">
            {COUPLE.name1} & {COUPLE.name2}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-white/50">11 · 12 · 2026</p>
        </footer>
      </section>
    </main>
  )
}

function EventCard({ label, place, meta, mapsUrl }: {
  label: string
  place: string
  meta: string
  mapsUrl: string
}) {
  return (
    <div className="flex flex-col items-center bg-primary/95 px-8 py-12 text-center">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/60">
        {label}
      </h3>
      <p className="mt-3 font-heading text-3xl leading-tight">{place}</p>
      <p className="mb-6 mt-2 text-sm text-white/70">{meta}</p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1.5 border-b border-white/40 pb-0.5 text-xs uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-white hover:text-white"
      >
        <MapPin className="h-3.5 w-3.5" />
        Ver en Maps
      </a>
    </div>
  )
}
