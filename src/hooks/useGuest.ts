import { useState, useCallback } from 'react'
import type { Guest } from '@/types/database'

const STORAGE_KEY = 'wedding_guest'

export function useGuest() {
  const [guest, setGuest] = useState<Guest | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const identify = useCallback((g: Guest) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(g))
    setGuest(g)
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setGuest(null)
  }, [])

  return { guest, identify, clear }
}
