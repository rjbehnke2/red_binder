/**
 * Edge Function callers — wired in Week 5.
 * All Claude API calls go through Supabase Edge Functions (server-side only).
 */

const EDGE_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : ''

async function callEdgeFunction(path, body) {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const res = await fetch(`${EDGE_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Edge function error: ${res.status}`)
  return res.json()
}

// Week 5: POST /ai/ritual-prompt
export const getRitualPrompt = (type, entries) =>
  callEdgeFunction('/ai-ritual-prompt', { type, entries })

// Week 5: POST /ai/deferral-scan
export const getDeferralNudge = (entries) =>
  callEdgeFunction('/ai-deferral-scan', { entries })

// Week 5: POST /ai/entry-assist
export const getEntryAssist = (entry) =>
  callEdgeFunction('/ai-entry-assist', { entry })
