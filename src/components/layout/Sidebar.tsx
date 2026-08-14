import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Palette,
  ExternalLink,
  Store,
  Calculator,
  X,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/orders', icon: ShoppingCart, label: 'Commandes' },
  { to: '/products', icon: Package, label: 'Produits' },
  { to: '/accounting', icon: Calculator, label: 'Comptabilité' },
  { to: '/designer', icon: Palette, label: 'Designer' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { stats, products } = useStore()
  const storeLabel = products[0]?.name ?? 'Ma boutique'

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gray-900 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">DashMatrix</p>
              <p className="text-xs text-gray-400">{storeLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {label}
              {to === '/orders' && stats.pendingOrders > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                  {stats.pendingOrders}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <NavLink to="/store" onClick={onClose} className="sidebar-link">
            <ExternalLink size={20} />
            Voir la boutique
          </NavLink>
        </div>
      </aside>
    </>
  )
}
