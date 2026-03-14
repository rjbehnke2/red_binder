import { useState, useMemo } from 'react'
import { useEntriesStore } from '../store/entriesStore'
import EntryCard from '../components/entries/EntryCard'

export default function Search() {
  const entries = useEntriesStore((s) => s.entries)
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return entries.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.quote?.toLowerCase().includes(q) ||
        e.reflection?.toLowerCase().includes(q) ||
        e.source?.toLowerCase().includes(q)
    )
  }, [query, entries])

  return (
    <div className="space-y-4">
      <input
        className="input"
        type="search"
        placeholder="Search entries, quotes, reflections..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      {query && (
        <p className="text-xs text-gray-600">{results.length} result{results.length !== 1 ? 's' : ''}</p>
      )}
      {results.length === 0 && query && (
        <div className="card text-center py-10">
          <p className="text-gray-500">No results for "{query}"</p>
        </div>
      )}
      {!query && (
        <p className="text-sm text-gray-600 text-center mt-8">
          Search across all your entries, quotes, and reflections.
        </p>
      )}
      <div className="space-y-3">
        {results.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}
