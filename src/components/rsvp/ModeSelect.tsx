import { ArrowRight } from 'lucide-react'

export default function ModeSelect({ onEasy, onHard }: { onEasy: () => void; onHard: () => void }) {
  return (
    <div className="space-y-4">
      <ModeCard title="Modo fácil" onClick={onEasy} />
      <ModeCard title="Modo difícil" onClick={onHard} dark />
    </div>
  )
}

function ModeCard({ title, onClick, dark = false }: {
  title: string
  onClick: () => void
  dark?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between gap-4 rounded-md border px-6 py-5 text-left transition-colors ${
        dark
          ? 'border-primary bg-primary text-white hover:bg-primary/90'
          : 'border-secondary bg-white text-primary hover:border-primary'
      }`}
    >
      <span className="font-heading text-2xl font-medium">{title}</span>
      <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
    </button>
  )
}
