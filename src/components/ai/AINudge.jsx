/**
 * AINudge — displays AI-generated prompts and insights.
 * Wired to Supabase Edge Functions in Week 5.
 */
export default function AINudge({ prompt }) {
  if (!prompt) return null

  return (
    <div className="card border-brand-600/30 bg-brand-600/5">
      <p className="text-xs text-brand-400 font-medium uppercase tracking-wide mb-1">AI Insight</p>
      <p className="text-sm text-gray-300">{prompt}</p>
    </div>
  )
}
