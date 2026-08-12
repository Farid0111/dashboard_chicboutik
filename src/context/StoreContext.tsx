import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type {
  Order,
  OrderStatus,
  Product,
  SiteContent,
  DashboardStats,
  Expense,
  AccountingSummary,
  AccountingPeriod,
} from '../types'
import { initialSiteContent, initialExpenses } from '../data/mockData'
import { computeAccountingSummary } from '../utils/accounting'
import { normalizeSiteContent } from '../utils/siteContent'

function mapSupabaseOrder(row: any): Order {
  const items = row.items && Array.isArray(row.items)
    ? row.items.map((item: any) => ({
        productId: item.productId ?? item.product ?? '',
        name: item.name ?? item.product ?? '',
        quantity: Number(item.quantity ?? 1),
        price: Number(item.price ?? item.unit_price ?? 0),
        image: item.image ?? '',
        variant: item.variant ?? item.color ?? '',
      }))
    : [
        {
          productId: row.product ?? '',
          name: row.product ?? '',
          quantity: Number(row.quantity ?? 1),
          price: Number(row.unit_price ?? row.price ?? 0),
          image: '',
          variant: row.color ?? row.variant ?? '',
        },
      ]
  return {
    id: String(row.id),
    customerName: row.customer_name ?? row.name ?? '',
    customerEmail: row.customer_email ?? '',
    customerPhone: row.customer_phone ?? row.phone ?? '',
    address: row.address ?? '',
    city: row.city ?? '',
    items,
    total: Number(row.total) || 0,
    status: (row.status ?? 'pending') as OrderStatus,
    createdAt: row.created_at ?? new Date().toISOString(),
    notes: row.notes,
  }
}

function mapSupabaseProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    price: row.price ?? 0,
    comparePrice: row.compare_price ?? row.comparePrice,
    category: row.category ?? 'Autre',
    stock: row.stock ?? 0,
    image: row.image ?? '',
    images: row.images ?? [],
    variants: row.variants ?? [],
    features: row.features ?? [],
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? row.reviewCount ?? 0,
    active: row.active ?? true,
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

function mapSupabaseExpense(row: any): Expense {
  return {
    id: row.id,
    label: row.label,
    category: row.category ?? 'other',
    amount: Number(row.amount) || 0,
    date: row.date ?? row.created_at ?? new Date().toISOString(),
    notes: row.notes,
  }
}

function mapSupabaseSiteContent(row: any): SiteContent {
  const sc: any = { ...initialSiteContent }
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    sc[camelKey] = value
  }
  return sc as SiteContent
}

function toDb(object: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(object)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    result[snakeKey] = value
  }
  return result
}

interface StoreContextValue {
  orders: Order[]
  products: Product[]
  siteContent: SiteContent
  expenses: Expense[]
  stats: DashboardStats
  accounting: AccountingSummary
  accountingPeriod: AccountingPeriod
  setAccountingPeriod: (period: AccountingPeriod) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  updateOrderNotes: (orderId: string, notes: string | null) => void
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  updateSiteContent: (updates: Partial<SiteContent>) => void
  addExpense: (expense: Omit<Expense, 'id'>) => void
  updateExpense: (id: string, updates: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  uploadImage: (file: File, path: string) => Promise<string>
  refreshData: () => void
  loading: boolean
  dbError: string | null
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [siteContent, setSiteContent] = useState<SiteContent>({
    urgencyBanner: '',
    urgencyBannerActive: false,
    stockWarning: '',
    stockCount: 0,
    productTitle: '',
    productIcon: '',
    productDescription: '',
    priceLabel: '',
    orderFormTitle: '',
    orderFormSubtitle: '',
    orderButtonText: '',
    whatsappNumber: '',
    whatsappActive: false,
    whyTitle: '',
    whyFeatures: [],
    whyCta: '',
    whyImage: '',
    heroTitle: '',
    heroText: '',
    heroImage: '',
    heroCta: '',
    deliveryTitle: '',
    deliveryText: '',
    deliveryImage: '',
    deliveryCta: '',
    faqTitle: '',
    faq: [],
    showcaseImage: '',
    compareImage: '',
    compareTitle: '',
    comparisons: [],
    statsTitle: '',
    statsImage: '',
    stats: [],
    testimonials: [],
    reviewsMapTitle: '',
    urgencyTitle: '',
    urgencyCta: '',
    primaryColor: '',
    buttonColor: '',
    facebookPixelId: '',
  })
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [accountingPeriod, setAccountingPeriod] = useState<AccountingPeriod>('all')
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (ordersData) setOrders(ordersData.map(mapSupabaseOrder))
      if (ordersError) console.error('Orders fetch error:', ordersError.message)

      const { data: productsData, error: productsError } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (productsData) setProducts(productsData.map(mapSupabaseProduct))
      if (productsError) console.error('Products fetch error:', productsError.message)

      const { data: siteContentData, error: siteContentError } = await supabase.from('site_content').select('*').single()
      if (siteContentData) setSiteContent(normalizeSiteContent(mapSupabaseSiteContent(siteContentData)))
      if (siteContentError) console.error('Site content fetch error:', siteContentError.message)

      const { data: expensesData, error: expensesError } = await supabase.from('expenses').select('*').order('date', { ascending: false })
      if (expensesData) setExpenses(expensesData.map(mapSupabaseExpense))
      if (expensesError) console.error('Expenses fetch error:', expensesError.message)
      setDbError(null)
    } catch (err) {
      console.error('Fetch error:', err)
      setDbError(err instanceof Error ? err.message : 'Unknown database error')
    } finally {
      setLoading(false)
    }
  }, [])

  const seedInitialData = useCallback(async () => {
    try {
      const { count: expensesCount, error: expensesError } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
      if (!expensesError && expensesCount === 0) {
        const expensePayloads = initialExpenses.map((e) => {
          const payload = toDb(e) as Record<string, any>
          Object.keys(payload).forEach((key) => {
            if (payload[key] === undefined) delete payload[key]
          })
          return payload
        })
        await supabase.from('expenses').insert(expensePayloads)
      }
    } catch (err) {
      console.error('Seed error:', err)
    }
  }, [])

  useEffect(() => {
    async function initialize() {
      await seedInitialData()
      await fetchData()
    }
    initialize()
  }, [seedInitialData, fetchData])

  // Real-time subscriptions for live updates
  useEffect(() => {
    const expensesChannel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        (payload: any) => {
          if (payload.eventType === 'DELETE') {
            setExpenses((prev) => prev.filter((e) => e.id !== String(payload.old.id)))
            return
          }
          const expense = mapSupabaseExpense(payload.new as any)
          setExpenses((prev) => {
            if (payload.eventType === 'INSERT') {
              return [expense, ...prev]
            } else if (payload.eventType === 'UPDATE') {
              return prev.map((e) => (e.id === expense.id ? expense : e))
            }
            return prev
          })
        }
      )
      .subscribe()

    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== String(payload.old.id)))
            return
          }
          const order = mapSupabaseOrder(payload.new as any)
          setOrders((prev) => {
            if (payload.eventType === 'INSERT') {
              return [order, ...prev]
            } else if (payload.eventType === 'UPDATE') {
              return prev.map((o) => (o.id === order.id ? order : o))
            }
            return prev
          })
        }
      )
      .subscribe()

    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload: any) => {
          if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((p) => p.id !== String(payload.old.id)))
            return
          }
          const product = mapSupabaseProduct(payload.new as any)
          setProducts((prev) => {
            if (payload.eventType === 'INSERT') {
              return [product, ...prev]
            } else if (payload.eventType === 'UPDATE') {
              return prev.map((p) => (p.id === product.id ? product : p))
            }
            return prev
          })
        }
      )
      .subscribe()

    const siteContentChannel = supabase
      .channel('site-content-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_content' },
        (payload: any) => {
          if (payload.new) {
            const content = mapSupabaseSiteContent(payload.new as any)
            setSiteContent(normalizeSiteContent(content))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(expensesChannel)
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(productsChannel)
      supabase.removeChannel(siteContentChannel)
    }
  }, [])

  useEffect(() => {
    let idleTimeout: ReturnType<typeof setTimeout> | null = null
    const IDLE_MS = 60000

    const resetIdleTimer = () => {
      if (idleTimeout) clearTimeout(idleTimeout)
      idleTimeout = setTimeout(() => {
        fetchData()
      }, IDLE_MS)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer, { passive: true })
    })

    idleTimeout = setTimeout(() => {
      fetchData()
    }, IDLE_MS)

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer)
      })
      if (idleTimeout) clearTimeout(idleTimeout)
    }
  }, [fetchData])

  const refreshData = useCallback(() => {
    fetchData()
  }, [fetchData])

  const stats: DashboardStats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    totalRevenue: orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0),
    totalProducts: products.filter((p) => p.active).length,
    lowStockProducts: products.filter((p) => p.stock <= 10 && p.active).length,
  }

  const accounting = useMemo(
    () => computeAccountingSummary(orders, expenses, accountingPeriod),
    [orders, expenses, accountingPeriod]
  )

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const prevOrders = orders
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
    if (error) {
      console.error('Error updating order status:', error.message, error.details)
      setOrders(prevOrders)
      throw error
    }
    if (!data || data.length === 0) {
      console.error('Order status update failed: no rows affected. Check RLS policies.')
      setOrders(prevOrders)
      throw new Error('Failed to update order status — run this SQL in Supabase SQL Editor: DROP POLICY IF EXISTS orders_anon_update ON orders; CREATE POLICY orders_anon_update ON orders FOR UPDATE USING (true); DROP POLICY IF EXISTS orders_anon_delete ON orders; CREATE POLICY orders_anon_delete ON orders FOR DELETE USING (true);')
    }
  }, [orders])

  const updateOrderNotes = useCallback(async (orderId: string, notes: string | null) => {
    const prevOrders = orders
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, notes: notes ?? '' } : o))
    )
    const { error } = await supabase
      .from('orders')
      .update({ notes: notes ?? '' })
      .eq('id', orderId)
    if (error) {
      console.error('Error updating order notes:', error.message, error.details)
      setOrders(prevOrders)
      throw error
    }
  }, [orders])

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setProducts((prev) => [newProduct, ...prev])
    const { error } = await supabase.from('products').insert(toDb(newProduct))
    if (error) {
      console.error('Error adding product:', error.message, error.details)
      setProducts((prev) => prev.filter((p) => p.id !== newProduct.id))
      throw error
    }
  }, [])

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const prevProducts = products
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
    const { error } = await supabase.from('products').update(toDb(updates)).eq('id', id)
    if (error) {
      console.error('Error updating product:', error.message, error.details)
      setProducts(prevProducts)
      throw error
    }
  }, [products])

  const deleteProduct = useCallback(async (id: string) => {
    const prevProducts = products
    setProducts((prev) => prev.filter((p) => p.id !== id))
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      console.error('Error deleting product:', error.message)
      setProducts(prevProducts)
    }
  }, [products])

  const updateSiteContent = useCallback(async (updates: Partial<SiteContent> | SiteContent) => {
    const prevContent = siteContent
    setSiteContent((prev) => normalizeSiteContent({ ...prev, ...updates }))
    const { error } = await supabase.from('site_content').upsert(toDb({ ...updates, id: 'main' }))
    if (error) {
      console.error('Error updating site content:', error.message, error.details)
      setSiteContent(prevContent)
      throw error
    }
  }, [siteContent])

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: `exp-${Date.now()}` }
    setExpenses((prev) => [newExpense, ...prev])
    const payload = toDb(newExpense) as Record<string, any>
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null) delete payload[key]
    })
    const { error } = await supabase.from('expenses').insert(payload)
    if (error) {
      console.error('Error adding expense:', error.message, error.details)
      setExpenses((prev) => prev.filter((e) => e.id !== newExpense.id))
      throw error
    }
  }, [])

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    const prevExpenses = expenses
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    )
    const payload = toDb(updates) as Record<string, any>
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key]
    })
    const { error } = await supabase.from('expenses').update(payload).eq('id', id)
    if (error) {
      console.error('Error updating expense:', error.message, error.details)
      setExpenses(prevExpenses)
      throw error
    }
  }, [expenses])

  const deleteExpense = useCallback(async (id: string) => {
    const prevExpenses = expenses
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) {
      console.error('Error deleting expense:', error.message)
      setExpenses(prevExpenses)
    }
  }, [expenses])

  const uploadImage = useCallback(async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${path}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
    return data.publicUrl
  }, [])

  return (
    <StoreContext.Provider
      value={{
        orders,
        products,
        siteContent,
        expenses,
        stats,
        accounting,
        accountingPeriod,
        setAccountingPeriod,
        updateOrderStatus,
        updateOrderNotes,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSiteContent,
        addExpense,
        updateExpense,
        deleteExpense,
         uploadImage,
         refreshData,
         loading,
         dbError,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}