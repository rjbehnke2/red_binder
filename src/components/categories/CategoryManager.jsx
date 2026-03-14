import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { useCategoriesStore } from '../../store/categoriesStore'
import { useUIStore } from '../../store/uiStore'

const PRESET_COLORS = [
  '#C0392B', '#8E44AD', '#2980B9', '#27AE60',
  '#E67E22', '#F39C12', '#16A085', '#7F8C8D',
]

const PRESET_ICONS = ['🧠', '👑', '⚡', '🤝', '💪', '💰', '🎨', '🔭', '📚', '🏆', '❤️', '🌱', '🎯', '🔑', '💡', '🛡️']

function CategoryRow({ cat, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xl w-7 text-center">{cat.icon}</span>
      <span className="flex-1 text-gray-200 text-sm">{cat.name}</span>
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
      <button onClick={() => onEdit(cat)} className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1 rounded">Edit</button>
      <button onClick={() => onDelete(cat.id)} className="text-gray-600 hover:text-red-400 text-xs px-2 py-1 rounded">✕</button>
    </div>
  )
}

function CategoryForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? '#C0392B')
  const [icon, setIcon] = useState(initial?.icon ?? '📌')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave({ name: name.trim(), color, icon })
    setSaving(false)
  }

  return (
    <div className="space-y-3 p-3 bg-surface-overlay rounded-xl border border-gray-700">
      <input
        className="input text-sm"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <div>
        <p className="text-xs text-gray-600 mb-1.5">Icon</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`text-lg w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                icon === ic ? 'bg-brand-600/30 ring-1 ring-brand-600' : 'hover:bg-gray-700'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-600 mb-1.5">Color</p>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface-overlay ring-white scale-110' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={!name.trim() || saving} className="btn-primary text-sm flex-1 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
      </div>
    </div>
  )
}

export default function CategoryManager() {
  const { categories, create, update, remove } = useCategories()
  const addToast = useUIStore((s) => s.addToast)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const handleCreate = async (fields) => {
    const { error } = await create(fields)
    if (error) addToast({ message: error.message, type: 'error' })
    else { addToast({ message: 'Category added!', type: 'success' }); setAdding(false) }
  }

  const handleUpdate = async (fields) => {
    const { error } = await update(editingId, fields)
    if (error) addToast({ message: error.message, type: 'error' })
    else { setEditingId(null) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Entries will lose their category assignment.')) return
    const { error } = await remove(id)
    if (error) addToast({ message: error.message, type: 'error' })
  }

  return (
    <div className="card space-y-1 divide-y divide-gray-800">
      {categories.map((cat) => (
        <div key={cat.id}>
          {editingId === cat.id ? (
            <div className="py-2">
              <CategoryForm
                initial={cat}
                onSave={handleUpdate}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <CategoryRow
              cat={cat}
              onEdit={(c) => { setEditingId(c.id); setAdding(false) }}
              onDelete={handleDelete}
            />
          )}
        </div>
      ))}

      {adding ? (
        <div className="pt-3">
          <CategoryForm onSave={handleCreate} onCancel={() => setAdding(false)} />
        </div>
      ) : (
        <div className="pt-3">
          <button
            onClick={() => { setAdding(true); setEditingId(null) }}
            className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            + Add category
          </button>
        </div>
      )}
    </div>
  )
}
