import { Link } from 'react-router-dom'
import { useRitualsStore } from '../store/ritualsStore'

export default function Rituals() {
  const completedTodayDaily = useRitualsStore((s) => s.completedTodayDaily)
  const completedTodayWeekly = useRitualsStore((s) => s.completedTodayWeekly)
  const streak = useRitualsStore((s) => s.streak)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-100">Rituals</h2>
        <p className="text-sm text-gray-500 mt-1">Daily and weekly practices to apply what you learn.</p>
      </div>

      {/* Streak */}
      <div className="card text-center py-6">
        <p className="text-5xl font-bold text-brand-500">{streak}</p>
        <p className="text-gray-400 mt-1">day streak</p>
      </div>

      {/* Daily ritual */}
      <div className="card space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-100">Daily Ritual</h3>
            <p className="text-sm text-gray-500 mt-0.5">3 steps · ~5 minutes</p>
          </div>
          {completedTodayDaily && (
            <span className="text-green-400 text-sm font-medium">✓ Done</span>
          )}
        </div>
        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
          <li>Capture one new insight</li>
          <li>Review one unapplied entry</li>
          <li>Commit to one action today</li>
        </ol>
        <button
          disabled={completedTodayDaily}
          className="btn-primary w-full disabled:opacity-50"
        >
          {completedTodayDaily ? 'Completed Today' : 'Start Daily Ritual'}
        </button>
        <p className="text-xs text-gray-600 text-center">Full ritual flow coming in Week 4</p>
      </div>

      {/* Weekly ritual */}
      <div className="card space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-100">Weekly Ritual</h3>
            <p className="text-sm text-gray-500 mt-0.5">5 steps · ~15 minutes · Sundays</p>
          </div>
          {completedTodayWeekly && (
            <span className="text-green-400 text-sm font-medium">✓ Done</span>
          )}
        </div>
        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
          <li>Review the week's entries</li>
          <li>Pick one insight to apply this week</li>
          <li>Check last week's commitment</li>
          <li>Update goals</li>
          <li>Gratitude reflection</li>
        </ol>
        <button
          disabled={completedTodayWeekly}
          className="btn-secondary w-full disabled:opacity-50"
        >
          {completedTodayWeekly ? 'Completed This Week' : 'Start Weekly Ritual'}
        </button>
        <p className="text-xs text-gray-600 text-center">Full ritual flow coming in Week 4</p>
      </div>
    </div>
  )
}
