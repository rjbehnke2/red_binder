import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import { useCategoriesStore } from '../../store/categoriesStore'

const STATUS_BADGE = {
  not_applied: { label: 'Not Applied', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  applied: { label: 'Applied', variant: 'success' },
}

export default function EntryCard({ entry }) {
  const categories = useCategoriesStore((s) => s.categories)
  const category = categories.find((c) => c.id === entry.category_id)
  const status = STATUS_BADGE[entry.status] ?? STATUS_BADGE.not_applied

  return (
    <Link to={`/entries/${entry.id}`} className="card block hover:border-gray-600 transition-colors group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-gray-100 group-hover:text-white leading-snug flex-1">
          {entry.title}
        </h3>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      {entry.quote && (
        <p className="text-sm text-gray-400 italic line-clamp-2 mb-2">"{entry.quote}"</p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {category && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </span>
        )}
        {entry.source && (
          <span className="text-xs text-gray-600">· {entry.source}</span>
        )}
        {entry.entry_type && (
          <span className="text-xs text-gray-600 capitalize">· {entry.entry_type}</span>
        )}
      </div>
    </Link>
  )
}
