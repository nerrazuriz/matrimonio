import { useCountdown } from '@/hooks/useCountdown'
import { Heart, MapPin, Calendar, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

const EVENT_DATE = new Date('2026-12-11T18:00:00')

const COUPLE = {
  name1: 'Nico',
  name2: 'Cote',
  date: '11 de Diciembre, 2026',
  ceremony: 'Capilla Nuestra Señora de la Esperanza',
  reception: 'Hacienda Porvenir',
}

export default function Home() {
  const countdown = useCountdown(EVENT_DATE)

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-muted">
            Nos casamos
          </p>

          <h1 className="font-heading text-5xl font-bold text-primary sm:text-7xl">
            {COUPLE.name1}
            <span className="mx-3 text-accent">&</span>
            {COUPLE.name2}
          </h1>

          <div className="mt-6 flex items-center justify-center gap-2 text-muted">
            <Calendar className="h-4 w-4" />
            <span className="text-lg">{COUPLE.date}</span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-2 text-muted">
            <MapPin className="h-4 w-4" />
            <span>{COUPLE.ceremony}</span>
          </div>

          {/* Countdown */}
          {!countdown.isExpired && (
            <div className="mt-10 flex justify-center gap-4 sm:gap-8">
              {([
                { value: countdown.days, label: 'Días' },
                { value: countdown.hours, label: 'Horas' },
                { value: countdown.minutes, label: 'Min' },
                { value: countdown.seconds, label: 'Seg' },
              ] as const).map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="font-heading text-4xl font-bold text-primary sm:text-5xl">
                    {String(value).padStart(2, '0')}
                  </span>
                  <span className="mt-1 text-xs uppercase tracking-wider text-muted">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12">
            <Link
              to="/rsvp"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              <Heart className="h-4 w-4" />
              Confirmar Asistencia
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 animate-bounce text-muted">
          <ChevronDown className="h-6 w-6" />
        </div>
      </section>

      {/* Info Cards */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          <InfoCard
            icon={<Calendar className="h-6 w-6" />}
            title="Ceremonia"
            detail="18:00 hrs"
            subtitle={COUPLE.ceremony}
          />
          <InfoCard
            icon={<MapPin className="h-6 w-6" />}
            title="Recepción"
            detail={COUPLE.reception}
            subtitle="Cena & Fiesta"
          />
          <InfoCard
            icon={<Heart className="h-6 w-6" />}
            title="Fecha"
            detail="11 de Diciembre"
            subtitle="Viernes, 2026"
          />
        </div>
      </section>
    </main>
  )
}

function InfoCard({ icon, title, detail, subtitle }: {
  icon: React.ReactNode
  title: string
  detail: string
  subtitle: string
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-secondary bg-white p-8 text-center shadow-sm">
      <div className="text-accent">{icon}</div>
      <h3 className="mt-3 text-xs font-medium uppercase tracking-wider text-muted">
        {title}
      </h3>
      <p className="mt-2 font-heading text-xl font-semibold text-primary">
        {detail}
      </p>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  )
}
