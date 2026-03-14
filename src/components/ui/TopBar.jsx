import { useLocation } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'

const PAGE_TITLES = {
  '/': 'Red Binder',
  '/browse': 'Browse',
  '/search': 'Search',
  '/rituals': 'Rituals',
  '/library': 'Library',
  '/settings': 'Settings',
}

export default function TopBar() {
  const location = useLocation()
  const setQuickCaptureOpen = useUIStore((s) => s.setQuickCaptureOpen)
  const title = PAGE_TITLES[location.pathname] ?? 'Red Binder'

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface border-b border-gray-800 h-14 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-brand-600" aria-hidden="true" />
        <span className="font-semibold text-gray-100 text-lg tracking-tight">{title}</span>
      </div>
      <button
        onClick={() => setQuickCaptureOpen(true)}
        className="btn-primary text-sm px-3 py-1.5"
        aria-label="Quick capture"
      >
        + Capture
      </button>
    </header>
  )
}
