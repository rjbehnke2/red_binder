/**
 * ai-ritual-prompt Edge Function
 * Generates a personalized ritual prompt using Claude API.
 * Wired with real logic in Week 5.
 *
 * POST /functions/v1/ai-ritual-prompt
 * Body: { type: 'daily' | 'weekly', entries: Entry[] }
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
    const { type, entries } = await req.json()

    // TODO Week 5: Replace stub with real Claude API call
    // const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
    // const message = await anthropic.messages.create({ ... })

    const stub = {
      prompt: `[Stub] ${type === 'daily' ? 'Daily' : 'Weekly'} ritual prompt based on ${entries?.length ?? 0} entries. Wire Claude in Week 5.`,
      generated_at: new Date().toISOString(),
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
