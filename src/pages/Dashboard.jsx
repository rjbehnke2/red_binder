import { Link } from 'react-router-dom'
import { useEntriesStore } from '../store/entriesStore'
import { useEntries } from '../hooks/useEntries'
import { useCategories } from '../hooks/useCategories'
import { useRituals } from '../hooks/useRituals'
import EntryCard from '../components/entries/EntryCard'

export default function Dashboard() {
  useEntries()
  useCategories()
  const { streak, completedTodayDaily } = useRituals()

  const entries = useEntriesStore((s) => s.entries)
  const loading = useEntriesStore((s) => s.loading)

  const recentEntries = entries.slice(0, 5)
  const unapplied = entries.filter((e) => e.status === 'not_applied').length

  return (
    <div className="space-y-6">
      {/* Streak / Ritual Status */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Daily Streak</p>
          <p className="text-3xl font-bold text-brand-500">
            {streak} <span className="text-lg text-gray-400">days</span>
          </p>
        </div>
        <Link
          to="/rituals"
          className={`btn-primary text-sm ${completedTodayDaily ? 'opacity-60 pointer-events-none' : ''}`}
        >
          {completedTodayDaily ? '✓ Done Today' : 'Start Ritual'}
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-100">{entries.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Entries</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-400">{unapplied}</p>
          <p className="text-xs text-gray-500 mt-1">Not Yet Applied</p>
        </div>
      </div>

      {/* AI Nudge placeholder */}
      <div className="card border-brand-600/30 bg-brand-600/5">
        <p className="text-xs text-brand-400 font-medium uppercase tracking-wide mb-1">AI Nudge</p>
        <p className="text-sm text-gray-400 italic">
          AI-powered prompts arrive in Week 5 — based on your actual entries.
        </p>
      </div>

      {/* Recent entries */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-200">Recent Entries</h2>
          <Link to="/browse" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentEntries.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 text-sm">No entries yet.</p>
            <p className="text-gray-600 text-xs mt-1">Tap <strong>+ Capture</strong> to add your first insight.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
