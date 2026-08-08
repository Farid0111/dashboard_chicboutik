import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Products from './pages/Products'
import SiteDesigner from './pages/SiteDesigner'
import Accounting from './pages/Accounting'
import Store from './pages/Store'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:orderId" element={<OrderDetail />} />
        <Route path="products" element={<Products />} />
        <Route path="accounting" element={<Accounting />} />
        <Route path="designer" element={<SiteDesigner />} />
        <Route path="store" element={<Store />} />
      </Route>
    </Routes>
  )
}
