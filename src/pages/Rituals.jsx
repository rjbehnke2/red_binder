import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRituals } from '../hooks/useRituals'
import { useEntries } from '../hooks/useEntries'
import { useEntriesStore } from '../store/entriesStore'
import { useUIStore } from '../store/uiStore'

// ─── Shared helpers ──────────────────────────────────────────────────────────

function ProgressBar({ step, total }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${
            step > i ? 'bg-brand-600' : 'bg-gray-700'
          }`}
        />
      ))}
    </div>
  )
}

function StepHeader({ current, total, label }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="uppercase tracking-wide">
        Step {current} of {total}
      </span>
      <span>·</span>
      <span>{label}</span>
    </div>
  )
}

// ─── Daily Ritual ─────────────────────────────────────────────────────────────

function DailyReviewEntry({ entry, onNext, onClose }) {
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
      <StepHeader current={1} total={2} label="Review this insight" />
      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-100 leading-snug">{entry.title}</h3>
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

function DailyCommit({ entry, commitment, setCommitment, onFinish, saving }) {
  return (
    <div className="space-y-4">
      <StepHeader current={2} total={2} label="Make a commitment" />
      <div className="card space-y-1">
        <p className="text-xs text-gray-500">Applying</p>
        <p className="font-medium text-gray-200 text-sm">{entry.title}</p>
      </div>
      <div className="card space-y-3">
        <label className="text-sm text-gray-300 font-medium">Today I will…</label>
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

// ─── Weekly Ritual ────────────────────────────────────────────────────────────
// Steps: 1 Wins  2 Pick entry  3 Check last commitment  4 Gratitude  5 Done

function WeeklyWins({ wins, setWins, onNext }) {
  return (
    <div className="space-y-4">
      <StepHeader current={1} total={4} label="Celebrate wins" />
      <div className="card space-y-3">
        <p className="text-sm text-gray-300 font-medium">
          What went well this week?
        </p>
        <textarea
          className="input min-h-[110px] resize-none"
          placeholder="Big or small — list them out…"
          value={wins}
          onChange={(e) => setWins(e.target.value)}
          autoFocus
        />
        <p className="text-xs text-gray-600">
          Acknowledging wins reinforces the behaviours that created them.
        </p>
      </div>
      <button onClick={onNext} className="btn-primary w-full">
        Next →
      </button>
    </div>
  )
}

function WeeklyPickEntry({ entries, picked, onPick, onNext }) {
  if (entries.length === 0) {
    return (
      <div className="space-y-4">
        <StepHeader current={2} total={4} label="Pick one insight to apply" />
        <div className="card text-center py-8 space-y-3">
          <p className="text-4xl">📭</p>
          <p className="text-gray-400">No unapplied entries.</p>
          <Link to="/entries/new" className="btn-primary inline-block text-sm">Add an Entry</Link>
        </div>
        <button onClick={onNext} className="btn-secondary w-full">Skip →</button>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <StepHeader current={2} total={4} label="Pick one insight to apply this week" />
      <p className="text-xs text-gray-500">Tap an entry to select it, then continue.</p>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {entries.slice(0, 10).map((e) => (
          <button
            key={e.id}
            onClick={() => onPick(e)}
            className={`w-full text-left card border transition-colors ${
              picked?.id === e.id
                ? 'border-brand-600 bg-brand-600/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <p className="text-sm text-gray-200 font-medium leading-snug">{e.title}</p>
            {e.source && <p className="text-xs text-gray-500 mt-1">{e.source}</p>}
          </button>
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={!picked}
        className="btn-primary w-full disabled:opacity-50"
      >
        {picked ? `Apply "${picked.title.slice(0, 30)}…" this week →` : 'Select an entry first'}
      </button>
    </div>
  )
}

function WeeklyCheckCommitment({ lastCommitment, onNext }) {
  const [checked, setChecked] = useState(null)
  return (
    <div className="space-y-4">
      <StepHeader current={3} total={4} label="Check last week's commitment" />
      {lastCommitment ? (
        <div className="card space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Last week you committed to</p>
          <p className="text-gray-200 text-sm">{lastCommitment}</p>
          <p className="text-sm text-gray-400 font-medium mt-2">Did you follow through?</p>
          <div className="flex gap-2">
            {['Yes ✓', 'Partially', 'Not yet'].map((opt) => (
              <button
                key={opt}
                onClick={() => setChecked(opt)}
                className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${
                  checked === opt
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-6">
          <p className="text-gray-500 text-sm">No commitment from last week — fresh start!</p>
        </div>
      )}
      <button
        onClick={() => onNext(checked)}
        disabled={lastCommitment && !checked}
        className="btn-primary w-full disabled:opacity-50"
      >
        Next →
      </button>
    </div>
  )
}

function WeeklyGratitude({ gratitude, setGratitude, onFinish, saving }) {
  return (
    <div className="space-y-4">
      <StepHeader current={4} total={4} label="Gratitude" />
      <div className="card space-y-3">
        <p className="text-sm text-gray-300 font-medium">
          What are you grateful for this week?
        </p>
        <textarea
          className="input min-h-[100px] resize-none"
          placeholder="Three things, big or small…"
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          autoFocus
        />
      </div>
      <button
        onClick={onFinish}
        disabled={!gratitude.trim() || saving}
        className="btn-primary w-full disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Complete Weekly Ritual ✓'}
      </button>
    </div>
  )
}

// ─── Shared completion screen ─────────────────────────────────────────────────

function RitualDone({ title, message, streak, onClose }) {
  return (
    <div className="card text-center py-10 space-y-5">
      <div className="text-5xl animate-bounce">🔥</div>
      <div>
        <h3 className="text-xl font-bold text-gray-100">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{message}</p>
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

// ─── Ritual History ───────────────────────────────────────────────────────────

function RitualHistory({ rituals }) {
  if (rituals.length === 0) return null
  const recent = rituals.slice(0, 10)
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Recent History</h3>
      <div className="space-y-2">
        {recent.map((r) => {
          const date = new Date(r.completed_at)
          const label = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
          const rd = r.response_data ?? {}
          return (
            <div key={r.id} className="card py-2.5 px-3 flex items-start gap-3">
              <span className="text-base mt-0.5">{r.ritual_type === 'daily' ? '☀️' : '📅'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-400 capitalize">{r.ritual_type} ritual</span>
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
                {rd.commitment && (
                  <p className="text-xs text-gray-500 mt-1 truncate">"{rd.commitment}"</p>
                )}
                {rd.entry_title && (
                  <p className="text-xs text-brand-400 mt-0.5 truncate">{rd.entry_title}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Rituals() {
  useEntries()
  const {
    streak, completedTodayDaily, completedTodayWeekly, rituals,
    complete,
  } = useRituals()
  const entries = useEntriesStore((s) => s.entries)
  const addToast = useUIStore((s) => s.addToast)

  // Active flow: null | 'daily' | 'weekly'
  const [flow, setFlow] = useState(null)
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  // Daily state
  const [reviewedEntry, setReviewedEntry] = useState(null)
  const [commitment, setCommitment] = useState('')

  // Weekly state
  const [wins, setWins] = useState('')
  const [pickedEntry, setPickedEntry] = useState(null)
  const [gratitude, setGratitude] = useState('')

  const randomUnapplied = useMemo(() => {
    const pool = entries.filter((e) => e.status === 'not_applied')
    if (pool.length === 0) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }, [entries.length])

  const lastWeeklyCommitment = useMemo(() => {
    const last = rituals.find((r) => r.ritual_type === 'weekly')
    return last?.response_data?.weekly_commitment ?? null
  }, [rituals])

  const startFlow = (type) => {
    setFlow(type)
    setStep(1)
    setDone(false)
    setReviewedEntry(null)
    setCommitment('')
    setWins('')
    setPickedEntry(null)
    setGratitude('')
  }

  const closeFlow = () => {
    setFlow(null)
    setDone(false)
    setStep(1)
  }

  // ── Daily completion ──
  const finishDaily = async () => {
    setSaving(true)
    const { error } = await complete({
      ritual_type: 'daily',
      entry_id: reviewedEntry?.id,
      response_data: { commitment, entry_title: reviewedEntry?.title },
    })
    setSaving(false)
    if (error) { addToast({ message: error.message, type: 'error' }); return }
    setDone(true)
  }

  // ── Weekly completion ──
  const finishWeekly = async (checkResult) => {
    setSaving(true)
    const { error } = await complete({
      ritual_type: 'weekly',
      entry_id: pickedEntry?.id,
      response_data: {
        wins,
        weekly_commitment: pickedEntry?.title,
        last_commitment_check: checkResult,
        gratitude,
        entry_title: pickedEntry?.title,
      },
    })
    setSaving(false)
    if (error) { addToast({ message: error.message, type: 'error' }); return }
    setDone(true)
  }

  if (flow) {
    const isDaily = flow === 'daily'
    const totalSteps = isDaily ? 2 : 4

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-100">{isDaily ? 'Daily' : 'Weekly'} Ritual</h2>
          <button onClick={closeFlow} className="text-gray-500 hover:text-gray-300 text-sm">✕</button>
        </div>

        {!done && <ProgressBar step={step} total={totalSteps} />}

        {/* ── Daily steps ── */}
        {isDaily && !done && step === 1 && (
          <DailyReviewEntry entry={randomUnapplied} onNext={(e) => { setReviewedEntry(e); setStep(2) }} />
        )}
        {isDaily && !done && step === 2 && reviewedEntry && (
          <DailyCommit
            entry={reviewedEntry}
            commitment={commitment}
            setCommitment={setCommitment}
            onFinish={finishDaily}
            saving={saving}
          />
        )}

        {/* ── Weekly steps ── */}
        {!isDaily && !done && step === 1 && (
          <WeeklyWins wins={wins} setWins={setWins} onNext={() => setStep(2)} />
        )}
        {!isDaily && !done && step === 2 && (
          <WeeklyPickEntry
            entries={entries.filter((e) => e.status === 'not_applied')}
            picked={pickedEntry}
            onPick={setPickedEntry}
            onNext={() => setStep(3)}
          />
        )}
        {!isDaily && !done && step === 3 && (
          <WeeklyCheckCommitment
            lastCommitment={lastWeeklyCommitment}
            onNext={(result) => { setStep(4) }}
          />
        )}
        {!isDaily && !done && step === 4 && (
          <WeeklyGratitude
            gratitude={gratitude}
            setGratitude={setGratitude}
            onFinish={() => finishWeekly(null)}
            saving={saving}
          />
        )}

        {done && (
          <RitualDone
            title={isDaily ? 'Daily Ritual Complete!' : 'Weekly Ritual Complete!'}
            message={
              isDaily
                ? 'Consistency is the compounding interest of self-improvement.'
                : 'Another week of intentional growth. Well done.'
            }
            streak={streak}
            onClose={closeFlow}
          />
        )}
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

      {/* Daily */}
      <div className="card space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-100">Daily Ritual</h3>
            <p className="text-sm text-gray-500 mt-0.5">2 steps · ~5 minutes</p>
          </div>
          {completedTodayDaily && <span className="text-green-400 text-sm font-medium">✓ Done</span>}
        </div>
        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
          <li>Review one unapplied entry</li>
          <li>Commit to one action today</li>
        </ol>
        <button
          onClick={completedTodayDaily ? undefined : () => startFlow('daily')}
          disabled={completedTodayDaily}
          className="btn-primary w-full disabled:opacity-50"
        >
          {completedTodayDaily ? 'Completed Today ✓' : 'Start Daily Ritual'}
        </button>
      </div>

      {/* Weekly */}
      <div className="card space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-100">Weekly Ritual</h3>
            <p className="text-sm text-gray-500 mt-0.5">4 steps · ~15 minutes</p>
          </div>
          {completedTodayWeekly && <span className="text-green-400 text-sm font-medium">✓ Done</span>}
        </div>
        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
          <li>Celebrate the week's wins</li>
          <li>Pick one insight to apply next week</li>
          <li>Check last week's commitment</li>
          <li>Gratitude reflection</li>
        </ol>
        <button
          onClick={completedTodayWeekly ? undefined : () => startFlow('weekly')}
          disabled={completedTodayWeekly}
          className="btn-secondary w-full disabled:opacity-50"
        >
          {completedTodayWeekly ? 'Completed This Week ✓' : 'Start Weekly Ritual'}
        </button>
      </div>

      <RitualHistory rituals={rituals} />
    </div>
  )
}
