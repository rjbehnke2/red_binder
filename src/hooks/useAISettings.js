import { useState, useCallback } from 'react'

const STORAGE_KEY = 'rb_ai_settings'

const DEFAULTS = {
  nudgeEnabled: true,
  entryAssistEnabled: true,
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

function save(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {}
}

export function useAISettings() {
  const [settings, setSettings] = useState(load)

  const toggle = useCallback((key) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      save(next)
      return next
    })
  }, [])

  return { settings, toggle }
}
