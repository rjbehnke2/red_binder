/**
 * ai-entry-assist Edge Function
 * Suggests category and related entry links for a new entry.
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
    const { entry } = await req.json()

    // TODO Week 5: Replace with real Claude-based category + link suggestions
    const stub = {
      suggested_category: null,
      related_entry_ids: [],
      note: 'Wire Claude in Week 5 for real suggestions.',
    }

    return new Response(JSON.stringify(stub), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
