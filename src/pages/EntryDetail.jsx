import { useParams, useNavigate } from 'react-router-dom'
import { useEntriesStore } from '../store/entriesStore'
import { useCategoriesStore } from '../store/categoriesStore'
import Badge from '../components/ui/Badge'

const STATUS_OPTIONS = [
  { value: 'not_applied', label: 'Not Applied', variant: 'default' },
  { value: 'in_progress', label: 'In Progress', variant: 'warning' },
  { value: 'applied', label: 'Applied', variant: 'success' },
]

export default function EntryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const getEntryById = useEntriesStore((s) => s.getEntryById)
  const updateEntry = useEntriesStore((s) => s.updateEntry)
  const removeEntry = useEntriesStore((s) => s.removeEntry)
  const categories = useCategoriesStore((s) => s.categories)

  const entry = getEntryById(id)

  if (!entry) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Entry not found.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4 text-sm">Go back</button>
      </div>
    )
  }

  const category = categories.find((c) => c.id === entry.category_id)

  const handleStatusChange = (status) => updateEntry(id, { status })

  const handleDelete = () => {
    if (confirm('Delete this entry?')) {
      removeEntry(id)
      navigate(-1)
    }
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-300">← Back</button>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-100 mb-2">{entry.title}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {category && <span className="text-sm text-gray-400">{category.icon} {category.name}</span>}
          {entry.source && <span className="text-sm text-gray-500">· {entry.source}</span>}
          {entry.entry_type && <span className="text-sm text-gray-500 capitalize">· {entry.entry_type}</span>}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Application Status</p>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                entry.status === opt.value
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quote */}
      {entry.quote && (
        <div className="card border-l-2 border-brand-600">
          <p className="text-xs text-gray-500 mb-1">Key Quote</p>
          <p className="text-gray-300 italic">"{entry.quote}"</p>
        </div>
      )}

      {/* Reflection */}
      {entry.reflection && (
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">My Reflection</p>
          <p className="text-gray-300">{entry.reflection}</p>
        </div>
      )}

      {/* Application plan — placeholder for Week 2 */}
      <div className="card border border-dashed border-gray-700">
        <p className="text-xs text-gray-600 mb-1">Application Plan</p>
        <p className="text-gray-600 text-sm italic">Add your application plan in Week 2...</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleDelete} className="btn-secondary text-sm text-red-400 border-red-900/40 hover:border-red-700">
          Delete Entry
        </button>
      </div>
    </div>
  )
}
