import { useState } from 'react'
import { getRitualPrompt, getDeferralNudge, getEntryAssist } from '../lib/api'

/**
 * useAI — hook for AI Edge Function calls.
 * Wired in Week 5.
 */
export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const call = async (fn, ...args) => {
    setLoading(true)
    setError(null)
    try {
      return await fn(...args)
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getRitualPrompt: (...args) => call(getRitualPrompt, ...args),
    getDeferralNudge: (...args) => call(getDeferralNudge, ...args),
    getEntryAssist: (...args) => call(getEntryAssist, ...args),
  }
}
