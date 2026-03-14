import { Routes, Route, Navigate } from 'react-router-dom'
import { useSession } from './lib/auth'
import Layout from './components/ui/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Browse from './pages/Browse'
import Search from './pages/Search'
import EntryDetail from './pages/EntryDetail'
import NewEntry from './pages/NewEntry'
import Rituals from './pages/Rituals'
import Library from './pages/Library'
import Settings from './pages/Settings'

function RequireAuth({ children }) {
  const session = useSession()
  if (session === undefined) {
    // Still loading session from Supabase
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!session) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  const session = useSession()

  return (
    <Routes>
      <Route
        path="/auth"
        element={session ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="browse" element={<Browse />} />
        <Route path="search" element={<Search />} />
        <Route path="entries/new" element={<NewEntry />} />
        <Route path="entries/:id" element={<EntryDetail />} />
        <Route path="rituals" element={<Rituals />} />
        <Route path="library" element={<Library />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
