/**
 * ai-deferral-scan Edge Function
 * Surfaces entries stuck at "Not Applied" for 2+ weeks and generates
 * a short Claude-powered accountability nudge.
 *
 * POST /functions/v1/ai-deferral-scan
 * Body: { entries: Entry[] }
 * Returns: { stale_entries: Entry[], count: number, nudge_message: string }
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'

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

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const stale = (entries ?? [])
      .filter(
        (e: any) =>
          e.status === 'not_applied' &&
          e.created_at &&
          new Date(e.created_at) < twoWeeksAgo
      )
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    let nudge_message = ''

    if (stale.length > 0) {
      const entryList = stale
        .slice(0, 3)
        .map((e: any) => `- "${e.title}"${e.source ? ` (from ${e.source})` : ''}`)
        .join('\n')

      const ageDays = Math.floor(
        (Date.now() - new Date(stale[0].created_at).getTime()) / (1000 * 60 * 60 * 24)
      )

      const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        system: `You are a direct, warm accountability coach. Write 1–2 short sentences calling out that the user has been sitting on insights without acting. Be honest and encouraging, not preachy. Reference the age and count specifically.`,
        messages: [{
          role: 'user',
          content: `The user has ${stale.length} insight${stale.length > 1 ? 's' : ''} they captured but haven't applied. The oldest is ${ageDays} days old. Here are the top ones:\n${entryList}\n\nWrite a brief accountability nudge.`,
        }],
      })

      nudge_message = (message.content[0] as any).text?.trim() ?? ''
    }

    return new Response(
      JSON.stringify({ stale_entries: stale, count: stale.length, nudge_message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
