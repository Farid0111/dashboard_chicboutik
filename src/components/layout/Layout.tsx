import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useStore } from '../../context/StoreContext'
import { Menu } from 'lucide-react'

export default function Layout() {
  const { loading } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <img src="/favicon.svg" alt="DashMatrix" className="h-12 w-12 animate-pulse" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-2 top-2 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden"
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      <main className="ml-0 lg:ml-64">
        <Outlet />
      </main>
    </div>
  )
}
