import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { useCategoriesStore } from '../store/categoriesStore'
import { useUIStore } from '../store/uiStore'

const ENTRY_TYPES = ['book', 'article', 'podcast', 'video', 'conversation', 'experience', 'other']

const EMPTY_FORM = {
  title: '',
  entry_type: 'book',
  category_id: '',
  source: '',
  quote: '',
  reflection: '',
  status: 'not_applied',
  application: {
    plan: '',
    when: '',
    signal: '',
    smallest_test: '',
    result: '',
  },
}

export default function NewEntry() {
  const navigate = useNavigate()
  const { create } = useEntries()
  const categories = useCategoriesStore((s) => s.categories)
  const addToast = useUIStore((s) => s.addToast)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [showApplication, setShowApplication] = useState(false)

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const setAppField = (key, val) =>
    setForm((f) => ({ ...f, application: { ...f.application, [key]: val } }))

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const payload = {
      ...form,
      category_id: form.category_id || null,
      // Strip empty application object
      application: Object.values(form.application).some(Boolean) ? form.application : {},
    }
    const { data, error } = await create(payload)
    setSaving(false)
    if (error) {
      addToast({ message: error.message, type: 'error' })
    } else {
      addToast({ message: 'Entry saved!', type: 'success' })
      navigate(`/entries/${data.id}`)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-300">← Back</button>
        <h1 className="font-bold text-gray-100 text-lg">New Entry</h1>
      </div>

      <div className="space-y-4">
        {/* Core fields */}
        <div className="card space-y-3">
          <h2 className="text-xs text-gray-500 uppercase tracking-wide">Basics</h2>
          <input
            className="input"
            placeholder="Title or key idea *"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={form.entry_type} onChange={(e) => setField('entry_type', e.target.value)}>
              {ENTRY_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <select className="input" value={form.category_id} onChange={(e) => setField('category_id', e.target.value)}>
              <option value="">Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <input
            className="input"
            placeholder="Source (book, article, podcast…)"
            value={form.source}
            onChange={(e) => setField('source', e.target.value)}
          />
        </div>

        {/* Capture */}
        <div className="card space-y-3">
          <h2 className="text-xs text-gray-500 uppercase tracking-wide">Capture</h2>
          <textarea
            className="input min-h-[100px] resize-none"
            placeholder="Key quote or passage…"
            value={form.quote}
            onChange={(e) => setField('quote', e.target.value)}
          />
          <textarea
            className="input min-h-[120px] resize-none"
            placeholder="My reflection — what does this mean for me?"
            value={form.reflection}
            onChange={(e) => setField('reflection', e.target.value)}
          />
        </div>

        {/* Application */}
        <div className="card space-y-3">
          <button
            type="button"
            onClick={() => setShowApplication((v) => !v)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-xs text-gray-500 uppercase tracking-wide">Application Plan</h2>
            <span className="text-gray-600 text-sm">{showApplication ? '▲' : '▼'}</span>
          </button>
          {showApplication && (
            <div className="space-y-3 pt-1">
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder="What specifically will I do?"
                value={form.application.plan}
                onChange={(e) => setAppField('plan', e.target.value)}
              />
              <input
                className="input"
                placeholder="By when?"
                value={form.application.when}
                onChange={(e) => setAppField('when', e.target.value)}
              />
              <input
                className="input"
                placeholder="How will I know it worked?"
                value={form.application.signal}
                onChange={(e) => setAppField('signal', e.target.value)}
              />
              <input
                className="input"
                placeholder="Smallest possible test?"
                value={form.application.smallest_test}
                onChange={(e) => setAppField('smallest_test', e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Status */}
        <div className="card space-y-2">
          <h2 className="text-xs text-gray-500 uppercase tracking-wide">Status</h2>
          <div className="flex gap-2">
            {[
              { value: 'not_applied', label: 'Not Applied' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'applied', label: 'Applied' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setField('status', opt.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  form.status === opt.value
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!form.title.trim() || saving}
          className="btn-primary w-full disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Entry'}
        </button>
      </div>
    </div>
  )
}
