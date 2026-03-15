import { useState, useEffect, useRef } from 'react'
import { getDeferralNudge } from '../lib/api'

function todayKey(userId) {
  const d = new Date()
  return `rb_deferral_${userId}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function hasStaleEntries(entries) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)
  return entries.some(
    (e) => e.status === 'not_applied' && e.created_at && new Date(e.created_at) < cutoff
  )
}

/**
 * Computes stale entries client-side and optionally fetches an AI nudge message.
 * Fires once per day per user; result cached in sessionStorage.
 */
export function useDeferralScan({ enabled, entries, userId }) {
  const [result, setResult] = useState(null) // { stale_entries, count, nudge_message }
  const [loading, setLoading] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (!enabled || !userId || fetched.current) return
    if (entries.length === 0) return

    // Fast client-side stale check before bothering the Edge Function
    if (!hasStaleEntries(entries)) {
      fetched.current = true
      return
    }

    const key = todayKey(userId)
    const cached = sessionStorage.getItem(key)
    if (cached) {
      try {
        setResult(JSON.parse(cached))
        fetched.current = true
        return
      } catch {}
    }

    fetched.current = true
    setLoading(true)
    getDeferralNudge(entries)
      .then((res) => {
        if (res?.count > 0) {
          setResult(res)
          try { sessionStorage.setItem(key, JSON.stringify(res)) } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [enabled, userId, entries.length])

  return { result, loading }
}
