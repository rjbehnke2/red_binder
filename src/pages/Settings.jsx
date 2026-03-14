import { useCategoriesStore, DEFAULT_CATEGORIES } from '../store/categoriesStore'

export default function Settings() {
  const categories = useCategoriesStore((s) => s.categories)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-100">Settings</h2>
      </div>

      {/* Account — placeholder */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">Account</h3>
        <div className="card">
          <p className="text-sm text-gray-400">Supabase auth integration coming in Week 1 completion.</p>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">Categories ({categories.length})</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="card flex items-center gap-3">
              <span className="text-xl">{cat.icon}</span>
              <span className="flex-1 text-gray-200">{cat.name}</span>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600">Category management coming in Week 2.</p>
      </section>

      {/* AI Toggles — placeholder */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">AI Features</h3>
        <div className="card">
          <p className="text-sm text-gray-400">AI feature toggles coming in Week 5.</p>
        </div>
      </section>

      {/* PWA info */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">App</h3>
        <div className="card space-y-1">
          <p className="text-sm text-gray-300 font-medium">Red Binder</p>
          <p className="text-xs text-gray-600">Version 0.1.0 — MVP Week 1 Scaffold</p>
        </div>
      </section>
    </div>
  )
}
