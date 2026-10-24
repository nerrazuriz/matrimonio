import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export default function ModeSelect({ onEasy, onHard }: { onEasy: () => void; onHard: () => void }) {
  return (
    <div className="space-y-4">
      <ModeCard title="Modo fácil" onClick={onEasy} variant="light" />
      <ModeCard
        title="Modo difícil"
        note="Solo para cracks, participa por un cotillón especial si lo completas"
        onClick={onHard}
        variant="dark"
      />
    </div>
  )
}

function ModeCard({ title, note, onClick, variant }: {
  title: string
  note?: string
  onClick: () => void
  variant: 'light' | 'dark'
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center justify-between gap-4 rounded-md border px-6 py-5 text-left transition-colors',
        variant === 'light' && 'border-secondary bg-white text-primary hover:border-primary',
        variant === 'dark' && 'border-primary bg-primary text-white hover:bg-primary/90',
      )}
    >
      <span>
        <span className="block font-heading text-2xl font-medium">{title}</span>
        {note && <span className="mt-1 block text-xs text-white/70">{note}</span>}
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
    </button>
  )
}
