export function formatElapsed(ms: number) {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60), s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
