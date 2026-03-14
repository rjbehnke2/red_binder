/**
 * ai-deferral-scan Edge Function
 * Surfaces entries stuck at "Not Applied" for 3+ weeks.
 * Wired with real logic in Week 5.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { entries } = await req.json()

    const threeWeeksAgo = new Date()
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)

    const stale = (entries ?? []).filter(
      (e) =>
        e.status === 'not_applied' &&
        new Date(e.created_at) < threeWeeksAgo
    )

    return new Response(JSON.stringify({ stale_entries: stale, count: stale.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
