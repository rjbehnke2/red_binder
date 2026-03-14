import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import TopBar from './TopBar'
import QuickCapture from '../entries/QuickCapture'
import { useUIStore } from '../../store/uiStore'

export default function Layout() {
  const quickCaptureOpen = useUIStore((s) => s.quickCaptureOpen)

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-20 pt-14">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      {quickCaptureOpen && <QuickCapture />}
    </div>
  )
}
