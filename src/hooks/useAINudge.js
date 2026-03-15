import { useState, useEffect, useRef } from 'react'
import { getRitualPrompt } from '../lib/api'

function todayKey(userId) {
  const d = new Date()
  const date = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  return `rb_ai_nudge_${userId}_${date}`
}

/**
 * Fetches (and caches per-day per-user) an AI-generated daily nudge.
 * Only fires if `enabled` is true and `entries` has loaded.
 */
export function useAINudge({ enabled, entries, userId }) {
  const [nudge, setNudge] = useState(null)
  const [loading, setLoading] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (!enabled || !userId || fetched.current) return
    if (entries.length === 0) return // wait for entries to load

    const key = todayKey(userId)
    const cached = sessionStorage.getItem(key)
    if (cached) {
      setNudge(cached)
      fetched.current = true
      return
    }

    fetched.current = true
    setLoading(true)
    getRitualPrompt('daily', entries)
      .then((res) => {
        if (res?.prompt) {
          setNudge(res.prompt)
          try { sessionStorage.setItem(key, res.prompt) } catch {}
        }
      })
      .catch(() => {}) // fail silently — nudge is non-critical
      .finally(() => setLoading(false))
  }, [enabled, userId, entries.length])

  return { nudge, loading }
}
