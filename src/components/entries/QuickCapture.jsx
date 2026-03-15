import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { useEntries } from '../../hooks/useEntries'
import { useCategoriesStore } from '../../store/categoriesStore'
import { useAISettings } from '../../hooks/useAISettings'
import { getEntryAssist } from '../../lib/api'

const ENTRY_TYPES = ['book', 'article', 'podcast', 'video', 'conversation', 'experience', 'other']

export default function QuickCapture() {
  const navigate = useNavigate()
  const setQuickCaptureOpen = useUIStore((s) => s.setQuickCaptureOpen)
  const addToast = useUIStore((s) => s.addToast)
  const { create } = useEntries()
  const categories = useCategoriesStore((s) => s.categories)
  const { settings } = useAISettings()
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAILoading] = useState(false)
  const [aiUsed, setAIUsed] = useState(false)

  const [form, setForm] = useState({
    title: '',
    quote: '',
    reflection: '',
    category_id: '',
    entry_type: 'book',
    source: '',
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleAIAssist = async () => {
    setAILoading(true)
    try {
      const result = await getEntryAssist(
        { title: form.title, quote: form.quote, reflection: form.reflection, entry_type: form.entry_type },
        categories
      )
      if (result?.suggested_category_name && !form.category_id) {
        const match = categories.find(
          (c) => c.name.toLowerCase() === result.suggested_category_name.toLowerCase()
        )
        if (match) set('category_id', match.id)
      }
      setAIUsed(true)
    } catch {}
    setAILoading(false)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const { data, error } = await create({
      ...form,
      category_id: form.category_id || null,
      status: 'not_applied',
    })
    setSaving(false)
    if (error) {
      addToast({ message: error.message, type: 'error' })
    } else {
      addToast({ message: 'Entry captured!', type: 'success' })
      setQuickCaptureOpen(false)
      if (data) navigate(`/entries/${data.id}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQuickCaptureOpen(false)} />
      <div className="relative bg-surface-elevated rounded-t-2xl w-full max-w-2xl border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="font-semibold text-gray-100">Quick Capture</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setQuickCaptureOpen(false); navigate('/entries/new') }}
              className="text-xs text-brand-400 hover:text-brand-300"
            >
              Full form →
            </button>
            <button onClick={() => setQuickCaptureOpen(false)} className="text-gray-400 hover:text-gray-200 p-1">✕</button>
          </div>
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
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
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
          {settings.entryAssistEnabled && form.title.trim() && !aiUsed && (
            <button
              type="button"
              onClick={handleAIAssist}
              disabled={aiLoading}
              className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 disabled:opacity-50 transition-colors"
            >
              {aiLoading ? (
                <>
                  <span className="w-3 h-3 border border-brand-500 border-t-transparent rounded-full animate-spin" />
                  Thinking…
                </>
              ) : (
                <>✨ AI Assist — suggest category</>
              )}
            </button>
          )}
          {aiUsed && <p className="text-xs text-green-500">✓ Category suggested</p>}
          <button
            onClick={handleSave}
            disabled={!form.title.trim() || saving}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}
