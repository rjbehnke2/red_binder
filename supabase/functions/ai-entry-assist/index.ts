/**
 * ai-entry-assist Edge Function
 * Suggests a category name and application plan starter for a new entry.
 *
 * POST /functions/v1/ai-entry-assist
 * Body: { entry: { title, quote?, reflection?, entry_type? }, categories: { name }[] }
 * Returns: { suggested_category_name: string | null, plan_starter: string }
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
    const { entry, categories } = await req.json()

    const categoryList = (categories ?? []).map((c: any) => c.name).join(', ')

    const userPrompt = [
      `Title: ${entry.title}`,
      entry.quote ? `Quote: "${entry.quote.slice(0, 300)}"` : null,
      entry.reflection ? `Reflection: ${entry.reflection.slice(0, 300)}` : null,
      entry.entry_type ? `Type: ${entry.entry_type}` : null,
      categoryList ? `Available categories: ${categoryList}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const systemPrompt = `You are a personal knowledge management assistant.
Given a new entry a user is capturing, return a JSON object with exactly two fields:
1. "suggested_category_name": the best matching category from the available list (exact name, or null if none fits)
2. "plan_starter": a single concrete sentence starting with "I will" that turns this insight into a specific action the user could take this week.

Return ONLY the JSON object, nothing else.`

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const raw = (message.content[0] as any).text?.trim() ?? '{}'
    let parsed: any = {}
    try {
      parsed = JSON.parse(raw)
    } catch {
      // If parsing fails, extract what we can
      parsed = { suggested_category_name: null, plan_starter: raw.slice(0, 200) }
    }

    return new Response(JSON.stringify({
      suggested_category_name: parsed.suggested_category_name ?? null,
      plan_starter: parsed.plan_starter ?? '',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
