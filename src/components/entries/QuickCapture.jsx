import { useState } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useEntriesStore } from '../../store/entriesStore'
import { useCategoriesStore } from '../../store/categoriesStore'

const ENTRY_TYPES = ['book', 'article', 'podcast', 'video', 'conversation', 'experience', 'other']

export default function QuickCapture() {
  const setQuickCaptureOpen = useUIStore((s) => s.setQuickCaptureOpen)
  const addEntry = useEntriesStore((s) => s.addEntry)
  const categories = useCategoriesStore((s) => s.categories)
  const addToast = useUIStore((s) => s.addToast)

  const [form, setForm] = useState({
    title: '',
    quote: '',
    reflection: '',
    category_id: '',
    entry_type: 'book',
    source: '',
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSave = () => {
    if (!form.title.trim()) return
    addEntry({
      id: crypto.randomUUID(),
      ...form,
      status: 'not_applied',
      created_at: new Date().toISOString(),
    })
    addToast({ message: 'Entry captured!', type: 'success' })
    setQuickCaptureOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQuickCaptureOpen(false)} />
      <div className="relative bg-surface-elevated rounded-t-2xl w-full max-w-2xl border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="font-semibold text-gray-100">Quick Capture</h2>
          <button onClick={() => setQuickCaptureOpen(false)} className="text-gray-400 hover:text-gray-200 p-1">✕</button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto max-h-[80vh]">
          <input
            className="input"
            placeholder="Title or key idea *"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
              <option value="">Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select className="input" value={form.entry_type} onChange={(e) => set('entry_type', e.target.value)}>
              {ENTRY_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <input
            className="input"
            placeholder="Source (book title, article, etc.)"
            value={form.source}
            onChange={(e) => set('source', e.target.value)}
          />
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="Key quote or passage..."
            value={form.quote}
            onChange={(e) => set('quote', e.target.value)}
          />
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="Your reflection..."
            value={form.reflection}
            onChange={(e) => set('reflection', e.target.value)}
          />
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  )
}
