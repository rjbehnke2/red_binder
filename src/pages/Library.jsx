import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { useEntriesStore } from '../store/entriesStore'

const TYPE_ICON = {
  book: '📚',
  article: '📰',
  podcast: '🎙️',
  video: '🎬',
  conversation: '💬',
  experience: '🌟',
  other: '📌',
}

export default function Library() {
  useEntries()
  const entries = useEntriesStore((s) => s.entries)
  const loading = useEntriesStore((s) => s.loading)
  const [filter, setFilter] = useState('all') // 'all' | entry_type values

  // Group entries by source; entries without a source go into an "Unsourced" bucket
  const sources = useMemo(() => {
    const map = new Map()
    for (const e of entries) {
      const key = e.source?.trim() || '—'
      if (!map.has(key)) {
        map.set(key, { source: key, type: e.entry_type, entries: [] })
      }
      map.get(key).entries.push(e)
    }
    // Sort by entry count desc
    return [...map.values()].sort((a, b) => b.entries.length - a.entries.length)
  }, [entries])

  const allTypes = useMemo(() => {
    const types = new Set(entries.map((e) => e.entry_type).filter(Boolean))
    return [...types]
  }, [entries])

  const filtered = useMemo(() => {
    if (filter === 'all') return sources
    return sources.filter((s) => s.entries.some((e) => e.entry_type === filter))
  }, [sources, filter])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-100">Library</h2>
        <p className="text-sm text-gray-500 mt-1">Sources you've learned from.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-xl font-bold text-gray-100">{entries.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Entries</p>
        </div>
        <div className="card text-center">
          <p className="text-xl font-bold text-gray-100">{sources.filter((s) => s.source !== '—').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Sources</p>
        </div>
        <div className="card text-center">
          <p className="text-xl font-bold text-gray-100">{entries.filter((e) => e.status === 'applied').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Applied</p>
        </div>
      </div>

      {/* Type filter */}
      {allTypes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              filter === 'all' ? 'bg-brand-600 text-white' : 'bg-surface-elevated text-gray-400 border border-gray-700'
            }`}
          >
            All
          </button>
          {allTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(filter === t ? 'all' : t)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors capitalize ${
                filter === t ? 'bg-brand-600 text-white' : 'bg-surface-elevated text-gray-400 border border-gray-700'
              }`}
            >
              {TYPE_ICON[t]} {t}
            </button>
          ))}
        </div>
      )}

      {/* Sources list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 border-dashed">
          <p className="text-3xl mb-3">📚</p>
          <p className="text-gray-400">No entries yet.</p>
          <Link to="/entries/new" className="btn-primary mt-4 inline-block text-sm">Add your first entry</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((src) => {
            const applied = src.entries.filter((e) => e.status === 'applied').length
            const dominant = src.entries[0]?.entry_type ?? 'other'
            return (
              <div key={src.source} className="card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{TYPE_ICON[dominant] ?? '📌'}</span>
                    <span className="font-medium text-gray-200 leading-snug">
                      {src.source === '—' ? <span className="text-gray-500 italic">No source</span> : src.source}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {src.entries.length} {src.entries.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
                {/* Entry pills */}
                <div className="flex flex-wrap gap-1.5">
                  {src.entries.slice(0, 5).map((e) => (
                    <Link
                      key={e.id}
                      to={`/entries/${e.id}`}
                      className="text-xs bg-surface-overlay px-2 py-1 rounded-full text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-600 transition-colors truncate max-w-[180px]"
                    >
                      {e.title}
                    </Link>
                  ))}
                  {src.entries.length > 5 && (
                    <span className="text-xs text-gray-600 px-2 py-1">+{src.entries.length - 5} more</span>
                  )}
                </div>
                {applied > 0 && (
                  <p className="text-xs text-green-500">{applied} applied</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
