import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'

export default function Modal({ title, children, onClose }) {
  const closeModal = useUIStore((s) => s.closeModal)
  const handleClose = onClose ?? closeModal

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handleClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative bg-surface-elevated rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h2 className="font-semibold text-gray-100">{title}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-200 p-1 rounded-lg"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
