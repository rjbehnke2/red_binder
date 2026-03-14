import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEntriesStore } from '../store/entriesStore'
import { useCategoriesStore } from '../store/categoriesStore'
import { useEntries } from '../hooks/useEntries'
import { useUIStore } from '../store/uiStore'

const STATUS_OPTIONS = [
  { value: 'not_applied', label: 'Not Applied' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'applied', label: 'Applied' },
]

const ENTRY_TYPES = ['book', 'article', 'podcast', 'video', 'conversation', 'experience', 'other']

export default function EntryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const getEntryById = useEntriesStore((s) => s.getEntryById)
  const categories = useCategoriesStore((s) => s.categories)
  const { update, remove } = useEntries()
  const addToast = useUIStore((s) => s.addToast)

  const entry = getEntryById(id)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  if (!entry) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Entry not found.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4 text-sm">Go back</button>
      </div>
    )
  }

  const category = categories.find((c) => c.id === entry.category_id)
  const app = entry.application ?? {}

  const startEdit = () => {
    setForm({
      title: entry.title,
      entry_type: entry.entry_type,
      category_id: entry.category_id ?? '',
      source: entry.source ?? '',
      quote: entry.quote ?? '',
      reflection: entry.reflection ?? '',
      status: entry.status,
      application: {
        plan: app.plan ?? '',
        when: app.when ?? '',
        signal: app.signal ?? '',
        smallest_test: app.smallest_test ?? '',
        result: app.result ?? '',
      },
    })
    setEditing(true)
  }

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const setAppField = (key, val) =>
    setForm((f) => ({ ...f, application: { ...f.application, [key]: val } }))

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const payload = {
      ...form,
      category_id: form.category_id || null,
      application: Object.values(form.application).some(Boolean) ? form.application : {},
    }
    const { error } = await update(id, payload)
    setSaving(false)
    if (error) {
      addToast({ message: error.message, type: 'error' })
    } else {
      addToast({ message: 'Entry updated!', type: 'success' })
      setEditing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this entry?')) return
    const { error } = await remove(id)
    if (error) {
      addToast({ message: error.message, type: 'error' })
    } else {
      navigate(-1)
    }
  }

  const handleStatusChange = async (status) => {
    const { error } = await update(id, { status })
    if (error) addToast({ message: error.message, type: 'error' })
  }

  if (editing && form) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setEditing(false)} className="text-sm text-gray-500 hover:text-gray-300">← Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="card space-y-3">
            <input className="input" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Title *" />
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.entry_type} onChange={(e) => setField('entry_type', e.target.value)}>
                {ENTRY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <select className="input" value={form.category_id} onChange={(e) => setField('category_id', e.target.value)}>
                <option value="">Category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <input className="input" value={form.source} onChange={(e) => setField('source', e.target.value)} placeholder="Source" />
          </div>

          <div className="card space-y-3">
            <textarea className="input min-h-[90px] resize-none" value={form.quote} onChange={(e) => setField('quote', e.target.value)} placeholder="Key quote…" />
            <textarea className="input min-h-[110px] resize-none" value={form.reflection} onChange={(e) => setField('reflection', e.target.value)} placeholder="My reflection…" />
          </div>

          <div className="card space-y-3">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide">Application</h3>
            <textarea className="input min-h-[80px] resize-none" value={form.application.plan} onChange={(e) => setAppField('plan', e.target.value)} placeholder="What will I do?" />
            <input className="input" value={form.application.when} onChange={(e) => setAppField('when', e.target.value)} placeholder="By when?" />
            <input className="input" value={form.application.signal} onChange={(e) => setAppField('signal', e.target.value)} placeholder="How will I know it worked?" />
            <input className="input" value={form.application.smallest_test} onChange={(e) => setAppField('smallest_test', e.target.value)} placeholder="Smallest test?" />
            <textarea className="input min-h-[80px] resize-none" value={form.application.result} onChange={(e) => setAppField('result', e.target.value)} placeholder="Result (fill in after attempting)…" />
          </div>

          <div className="card space-y-2">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide">Status</h3>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setField('status', opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.status === opt.value ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-700 text-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Read view
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-300">← Back</button>
        <div className="flex gap-2">
          <button onClick={startEdit} className="btn-secondary text-sm">Edit</button>
          <button onClick={handleDelete} className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-900/40 hover:border-red-700 transition-colors">Delete</button>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-100 mb-2">{entry.title}</h1>
        <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500">
          {category && <span>{category.icon} {category.name}</span>}
          {entry.source && <span>· {entry.source}</span>}
          {entry.entry_type && <span className="capitalize">· {entry.entry_type}</span>}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Status</p>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                entry.status === opt.value ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {entry.quote && (
        <div className="card border-l-2 border-brand-600">
          <p className="text-xs text-gray-500 mb-1">Key Quote</p>
          <p className="text-gray-300 italic">"{entry.quote}"</p>
        </div>
      )}

      {entry.reflection && (
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">My Reflection</p>
          <p className="text-gray-300 whitespace-pre-wrap">{entry.reflection}</p>
        </div>
      )}

      {/* Application section */}
      {(app.plan || app.when || app.signal || app.smallest_test || app.result) && (
        <div className="card space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Application</p>
          {app.plan && (
            <div>
              <p className="text-xs text-gray-600 mb-0.5">What I'll do</p>
              <p className="text-gray-300">{app.plan}</p>
            </div>
          )}
          {app.when && (
            <div>
              <p className="text-xs text-gray-600 mb-0.5">By when</p>
              <p className="text-gray-300">{app.when}</p>
            </div>
          )}
          {app.signal && (
            <div>
              <p className="text-xs text-gray-600 mb-0.5">How I'll know it worked</p>
              <p className="text-gray-300">{app.signal}</p>
            </div>
          )}
          {app.smallest_test && (
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Smallest test</p>
              <p className="text-gray-300">{app.smallest_test}</p>
            </div>
          )}
          {app.result && (
            <div className="border-t border-gray-700 pt-3">
              <p className="text-xs text-green-500 mb-0.5">Result</p>
              <p className="text-gray-300">{app.result}</p>
            </div>
          )}
        </div>
      )}

      {!app.plan && (
        <div className="card border border-dashed border-gray-700">
          <p className="text-gray-600 text-sm">No application plan yet. <button onClick={startEdit} className="text-brand-400 hover:text-brand-300">Add one →</button></p>
        </div>
      )}
    </div>
  )
}
