/**
 * ai-ritual-prompt Edge Function
 * Generates a personalized daily nudge using Claude.
 *
 * POST /functions/v1/ai-ritual-prompt
 * Body: { type: 'daily' | 'weekly', entries: Entry[] }
 * Returns: { prompt: string, generated_at: string }
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
    const { type, entries } = await req.json()

    const unapplied = (entries ?? []).filter((e: any) => e.status === 'not_applied').slice(0, 5)

    const entryList = unapplied
      .map((e: any, i: number) => {
        const parts = [`${i + 1}. "${e.title}"`]
        if (e.source) parts.push(`   Source: ${e.source}`)
        if (e.quote) parts.push(`   Quote: "${e.quote.slice(0, 150)}"`)
        if (e.reflection) parts.push(`   Reflection: ${e.reflection.slice(0, 150)}`)
        return parts.join('\n')
      })
      .join('\n\n')

    const systemPrompt = type === 'daily'
      ? `You are a personal learning coach. Your job is to write a short, warm, actionable daily nudge (2–3 sentences) to help someone apply one of the insights they've captured but haven't yet put into practice. Be specific, grounded, and direct. Do not be generic. Do not use platitudes. Focus on one concrete thing they could do today.`
      : `You are a personal learning coach. Your job is to write a short weekly reflection prompt (2–3 sentences) that encourages the user to connect their captured insights to real-world action. Be warm, curious, and specific.`

    const userPrompt = unapplied.length > 0
      ? `Here are the user's unapplied entries:\n\n${entryList}\n\nWrite a ${type} nudge that references one of these insights and suggests a specific next action.`
      : `The user has no unapplied entries yet. Write a short encouraging message prompting them to capture their next insight.`

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const prompt = (message.content[0] as any).text?.trim() ?? ''

    return new Response(JSON.stringify({ prompt, generated_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
