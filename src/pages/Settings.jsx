import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from '../lib/auth'
import { useCategories } from '../hooks/useCategories'
import { useAISettings } from '../hooks/useAISettings'
import CategoryManager from '../components/categories/CategoryManager'

export default function Settings() {
  useCategories() // ensure categories are loaded
  const user = useUser()
  const { settings, toggle } = useAISettings()
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

      {/* AI Features */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">AI Features</h3>
        <div className="card space-y-4">
          {[
            { key: 'nudgeEnabled', label: 'Daily AI Nudge', description: 'Personalized prompt on your Dashboard each day based on your unapplied entries.' },
            { key: 'entryAssistEnabled', label: 'AI Entry Assist', description: 'Suggests a category and action plan starter when creating new entries.' },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-200 font-medium">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${
                  settings[key] ? 'bg-brand-600' : 'bg-gray-700'
                }`}
                aria-label={`Toggle ${label}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings[key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* App info */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">App</h3>
        <div className="card space-y-1">
          <p className="text-sm text-gray-300 font-medium">Red Binder</p>
          <p className="text-xs text-gray-600">Version 0.5.0 — MVP Week 5</p>
        </div>
      </section>
    </div>
  )
}
