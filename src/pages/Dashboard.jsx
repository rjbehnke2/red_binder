import { Link } from 'react-router-dom'
import { useEntriesStore } from '../store/entriesStore'
import { useEntries } from '../hooks/useEntries'
import { useCategories } from '../hooks/useCategories'
import { useRituals } from '../hooks/useRituals'
import { useAINudge } from '../hooks/useAINudge'
import { useDeferralScan } from '../hooks/useDeferralScan'
import { useAISettings } from '../hooks/useAISettings'
import { useUser } from '../lib/auth'
import AINudge from '../components/ai/AINudge'
import EntryCard from '../components/entries/EntryCard'

export default function Dashboard() {
  useEntries()
  useCategories()
  const { streak, completedTodayDaily } = useRituals()
  const { settings } = useAISettings()
  const user = useUser()

  const entries = useEntriesStore((s) => s.entries)
  const loading = useEntriesStore((s) => s.loading)

  const { nudge, loading: nudgeLoading } = useAINudge({
    enabled: settings.nudgeEnabled,
    entries,
    userId: user?.id,
  })

  const { result: deferral, loading: deferralLoading } = useDeferralScan({
    enabled: settings.nudgeEnabled,
    entries,
    userId: user?.id,
  })

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

      {/* AI Nudge */}
      {settings.nudgeEnabled && (
        nudgeLoading ? (
          <div className="card border-brand-600/30 bg-brand-600/5 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-xs text-brand-400">Generating your daily nudge…</p>
          </div>
        ) : (
          <AINudge prompt={nudge} />
        )
      )}

      {/* Deferral accountability section */}
      {settings.nudgeEnabled && (deferral?.count > 0) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⏳</span>
            <h2 className="font-semibold text-gray-200 text-sm">
              Sitting on {deferral.count} insight{deferral.count > 1 ? 's' : ''}
            </h2>
          </div>
          {deferral.nudge_message && (
            <div className="card border-yellow-700/40 bg-yellow-900/10">
              <p className="text-xs text-yellow-500 font-medium uppercase tracking-wide mb-1">Accountability</p>
              <p className="text-sm text-gray-300">{deferral.nudge_message}</p>
            </div>
          )}
          <div className="space-y-2">
            {deferral.stale_entries.slice(0, 3).map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
          {deferral.count > 3 && (
            <Link to="/browse" className="text-xs text-brand-400 hover:text-brand-300 block text-center">
              +{deferral.count - 3} more → Browse all
            </Link>
          )}
        </section>
      )}

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
