import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'

function ToastItem({ toast }) {
  const removeToast = useUIStore((s) => s.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration ?? 3500)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, removeToast])

  const variants = {
    success: 'border-green-600/40 bg-green-900/20 text-green-300',
    error: 'border-red-600/40 bg-red-900/20 text-red-300',
    info: 'border-blue-600/40 bg-blue-900/20 text-blue-300',
    default: 'border-gray-600/40 bg-surface-elevated text-gray-200',
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm ${variants[toast.type ?? 'default']}`}>
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)

  if (!toasts.length) return null

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
