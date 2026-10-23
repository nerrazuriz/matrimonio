import { cn } from '@/lib/cn'

export function Divider({ className, light = false }: { className?: string; light?: boolean }) {
  const line = light ? 'bg-white/30' : 'bg-accent/50'
  const dot = light ? 'bg-white/60' : 'bg-accent'
  return (
    <div aria-hidden="true" className={cn('flex items-center justify-center gap-3', className)}>
      <span className={cn('h-px w-12', line)} />
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      <span className={cn('h-px w-12', line)} />
    </div>
  )
}
