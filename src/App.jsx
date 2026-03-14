import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/ui/Layout'
import Dashboard from './pages/Dashboard'
import Browse from './pages/Browse'
import Search from './pages/Search'
import EntryDetail from './pages/EntryDetail'
import Rituals from './pages/Rituals'
import Library from './pages/Library'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="browse" element={<Browse />} />
        <Route path="search" element={<Search />} />
        <Route path="entries/:id" element={<EntryDetail />} />
        <Route path="rituals" element={<Rituals />} />
        <Route path="library" element={<Library />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
