/**
 * Hook: useAcquiredSkills
 * Persists the set of skill IDs the user has marked as acquired in localStorage.
 */

import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "wp-acquired-skills"

export function useAcquiredSkills() {
  const [acquired, setAcquired] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setAcquired(new Set(JSON.parse(stored) as string[]))
    } catch { /* ignore */ }
  }, [])

  const toggle = useCallback((skillId: string) => {
    setAcquired((prev) => {
      const next = new Set(prev)
      if (next.has(skillId)) next.delete(skillId)
      else next.add(skillId)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
      } catch { /* ignore */ }
      return next
    })
  }, [])

  const markAll = useCallback((skillIds: string[]) => {
    setAcquired((prev) => {
      const next = new Set(prev)
      for (const id of skillIds) next.add(id)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
      } catch { /* ignore */ }
      return next
    })
  }, [])

  return { acquired, toggle, markAll }
}
