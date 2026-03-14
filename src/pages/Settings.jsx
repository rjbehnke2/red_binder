import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from '../lib/auth'
import { useCategories } from '../hooks/useCategories'
import CategoryManager from '../components/categories/CategoryManager'

export default function Settings() {
  useCategories() // ensure categories are loaded
  const user = useUser()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-100">Settings</h2>

      {/* Account */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">Account</h3>
        <div className="card space-y-3">
          <p className="text-sm text-gray-300">{user?.email}</p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="btn-secondary text-sm w-full disabled:opacity-50"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">Categories</h3>
        <CategoryManager />
      </section>

      {/* AI Toggles — placeholder */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">AI Features</h3>
        <div className="card">
          <p className="text-sm text-gray-400">AI feature toggles coming in Week 5.</p>
        </div>
      </section>

      {/* App info */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">App</h3>
        <div className="card space-y-1">
          <p className="text-sm text-gray-300 font-medium">Red Binder</p>
          <p className="text-xs text-gray-600">Version 0.2.0 — MVP Week 2</p>
        </div>
      </section>
    </div>
  )
}
