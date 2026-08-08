import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useStore } from '../../context/StoreContext'

export default function Layout() {
  const { loading } = useStore()

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
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-64">
        <Outlet />
      </main>
    </div>
  )
}
