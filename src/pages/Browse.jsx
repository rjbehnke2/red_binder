import { useState } from 'react'
import { useEntriesStore } from '../store/entriesStore'
import { useCategoriesStore } from '../store/categoriesStore'
import { useUIStore } from '../store/uiStore'
import { useEntries } from '../hooks/useEntries'
import { useCategories } from '../hooks/useCategories'
import EntryCard from '../components/entries/EntryCard'

export default function Browse() {
  useEntries()
  useCategories()
  const entries = useEntriesStore((s) => s.entries)
  const loading = useEntriesStore((s) => s.loading)
  const categories = useCategoriesStore((s) => s.categories)
  const viewMode = useUIStore((s) => s.viewMode)
  const setViewMode = useUIStore((s) => s.setViewMode)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)

  const filtered = entries.filter((e) => {
    if (selectedCategory && e.category_id !== selectedCategory) return false
    if (selectedStatus && e.status !== selectedStatus) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            !selectedCategory ? 'bg-brand-600 text-white' : 'bg-surface-elevated text-gray-400 border border-gray-700'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat.id ? 'bg-brand-600 text-white' : 'bg-surface-elevated text-gray-400 border border-gray-700'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Status filter + view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['not_applied', 'in_progress', 'applied'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(selectedStatus === s ? null : s)}
              className={`text-xs px-2.5 py-1 rounded-full capitalize transition-colors ${
                selectedStatus === s ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setViewMode('card')} className={`p-1.5 rounded ${viewMode === 'card' ? 'text-brand-500' : 'text-gray-600'}`}>⊞</button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'text-brand-500' : 'text-gray-600'}`}>☰</button>
        </div>
      </div>

      {/* Results */}
      <p className="text-xs text-gray-600">{filtered.length} entries</p>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-500">No entries match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
