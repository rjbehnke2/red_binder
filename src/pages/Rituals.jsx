import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRituals } from '../hooks/useRituals'
import { useEntries } from '../hooks/useEntries'
import { useEntriesStore } from '../store/entriesStore'
import { useUIStore } from '../store/uiStore'

// ─── Daily Ritual steps ───────────────────────────────────────────────────────
// Step 0: Intro
// Step 1: Review a random unapplied entry
// Step 2: Commit to one action today
// Step 3: Done / celebration

function StepIntro({ onStart }) {
  return (
    <div className="card text-center py-8 space-y-5">
      <div className="text-5xl">🌅</div>
      <div>
        <h3 className="text-lg font-bold text-gray-100">Daily Ritual</h3>
        <p className="text-sm text-gray-500 mt-1">~5 minutes · 3 steps</p>
      </div>
      <ol className="text-sm text-gray-400 text-left space-y-2 list-decimal list-inside max-w-xs mx-auto">
        <li>Review one insight you haven't applied yet</li>
        <li>Make one concrete commitment for today</li>
        <li>Lock it in</li>
      </ol>
      <button onClick={onStart} className="btn-primary w-full max-w-xs mx-auto">
        Begin
      </button>
    </div>
  )
}

function StepReviewEntry({ entry, category, onNext }) {
  if (!entry) {
    return (
      <div className="card text-center py-8 space-y-4">
        <p className="text-4xl">📭</p>
        <p className="text-gray-300 font-medium">No unapplied entries yet.</p>
        <p className="text-sm text-gray-500">Capture something new first, then come back.</p>
        <Link to="/entries/new" className="btn-primary block text-center">Add an Entry</Link>
      </div>
    )
  }

  const app = entry.application ?? {}

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="uppercase tracking-wide">Step 1 of 2</span>
        <span>·</span>
        <span>Review this insight</span>
      </div>

      <div className="card space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-100 leading-snug">{entry.title}</h3>
          {category && (
            <span className="text-xs text-gray-500 whitespace-nowrap">{category.icon} {category.name}</span>
          )}
        </div>
        {entry.source && <p className="text-xs text-gray-500">{entry.source}</p>}

        {entry.quote && (
          <blockquote className="border-l-2 border-brand-600 pl-3 text-sm text-gray-300 italic">
            "{entry.quote}"
          </blockquote>
        )}
        {entry.reflection && (
          <div>
            <p className="text-xs text-gray-600 mb-1">My reflection</p>
            <p className="text-sm text-gray-400">{entry.reflection}</p>
          </div>
        )}
        {app.plan && (
          <div className="bg-surface-overlay rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Application plan</p>
            <p className="text-sm text-gray-300">{app.plan}</p>
          </div>
        )}
      </div>

      <button onClick={() => onNext(entry)} className="btn-primary w-full">
        This is the one → Commit
      </button>
      <p className="text-xs text-center text-gray-600">
        <Link to={`/entries/${entry.id}`} className="text-brand-400 hover:text-brand-300">
          View full entry
        </Link>
      </p>
    </div>
  )
}

function StepCommit({ entry, commitment, setCommitment, onFinish, saving }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="uppercase tracking-wide">Step 2 of 2</span>
        <span>·</span>
        <span>Make a commitment</span>
      </div>

      <div className="card space-y-1">
        <p className="text-xs text-gray-500">Applying</p>
        <p className="font-medium text-gray-200 text-sm">{entry.title}</p>
      </div>

      <div className="card space-y-3">
        <label className="text-sm text-gray-300 font-medium">
          Today I will…
        </label>
        <textarea
          className="input min-h-[100px] resize-none"
          placeholder="Be specific. What exactly will you do, and when?"
          value={commitment}
          onChange={(e) => setCommitment(e.target.value)}
          autoFocus
        />
        <p className="text-xs text-gray-600">
          Tip: the more specific the better. "I will do X at Y time" {'>'} "I will try to do X"
        </p>
      </div>

      <button
        onClick={onFinish}
        disabled={!commitment.trim() || saving}
        className="btn-primary w-full disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Lock it in ✓'}
      </button>
    </div>
  )
}

function StepDone({ streak, onClose }) {
  return (
    <div className="card text-center py-10 space-y-5">
      <div className="text-5xl animate-bounce">🔥</div>
      <div>
        <h3 className="text-xl font-bold text-gray-100">Ritual Complete!</h3>
        <p className="text-sm text-gray-500 mt-1">Consistency is the compounding interest of self-improvement.</p>
      </div>
      <div className="inline-flex items-baseline gap-1">
        <span className="text-4xl font-bold text-brand-500">{streak}</span>
        <span className="text-gray-400">day streak</span>
      </div>
      <button onClick={onClose} className="btn-secondary w-full max-w-xs mx-auto">
        Done
      </button>
    </div>
  )
}

// ─── Main Rituals Page ────────────────────────────────────────────────────────

export default function Rituals() {
  useEntries()
  const {
    streak, completedTodayDaily, completedTodayWeekly,
    complete,
  } = useRituals()
  const entries = useEntriesStore((s) => s.entries)
  const addToast = useUIStore((s) => s.addToast)

  const [step, setStep] = useState(null) // null | 0 | 1 | 2 | 3
  const [reviewedEntry, setReviewedEntry] = useState(null)
  const [commitment, setCommitment] = useState('')
  const [saving, setSaving] = useState(false)

  // Pick a random unapplied entry deterministically for this session
  const randomUnapplied = useMemo(() => {
    const pool = entries.filter((e) => e.status === 'not_applied')
    if (pool.length === 0) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }, [entries.length])

  const startRitual = () => {
    setStep(1)
    setReviewedEntry(null)
    setCommitment('')
  }

  const handleEntryChosen = (entry) => {
    setReviewedEntry(entry)
    setStep(2)
  }

  const handleFinish = async () => {
    setSaving(true)
    const { error } = await complete({
      ritual_type: 'daily',
      entry_id: reviewedEntry?.id,
      response_data: { commitment, entry_title: reviewedEntry?.title },
    })
    setSaving(false)
    if (error) {
      addToast({ message: error.message, type: 'error' })
    } else {
      setStep(3)
    }
  }

  const handleClose = () => {
    setStep(null)
    setCommitment('')
    setReviewedEntry(null)
  }

  if (step !== null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-100">Daily Ritual</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-300 text-sm">✕</button>
        </div>

        {/* Progress bar */}
        {step < 3 && (
          <div className="flex gap-1.5">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? 'bg-brand-600' : 'bg-gray-700'}`}
              />
            ))}
          </div>
        )}

        {step === 1 && (
          <StepReviewEntry
            entry={randomUnapplied}
            category={null}
            onNext={handleEntryChosen}
          />
        )}
        {step === 2 && reviewedEntry && (
          <StepCommit
            entry={reviewedEntry}
            commitment={commitment}
            setCommitment={setCommitment}
            onFinish={handleFinish}
            saving={saving}
          />
        )}
        {step === 3 && <StepDone streak={streak} onClose={handleClose} />}
      </div>
    )
  }

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
          <li>Review one unapplied entry</li>
          <li>Commit to one action today</li>
          <li>Lock it in</li>
        </ol>
        <button
          onClick={completedTodayDaily ? undefined : startRitual}
          disabled={completedTodayDaily}
          className="btn-primary w-full disabled:opacity-50"
        >
          {completedTodayDaily ? 'Completed Today ✓' : 'Start Daily Ritual'}
        </button>
      </div>

      {/* Weekly ritual — placeholder until Week 4 */}
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
          disabled
          className="btn-secondary w-full opacity-40"
        >
          Coming in Week 4
        </button>
      </div>
    </div>
  )
}
