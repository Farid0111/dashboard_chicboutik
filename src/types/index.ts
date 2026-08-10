export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  image: string
  variant?: string
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  city: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: string
  notes?: string
}

export interface ProductVariant {
  id: string
  name: string
  color: string
  image: string
}

export interface ProductFeature {
  id: string
  text: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  category: string
  stock: number
  image: string
  images: string[]
  variants: ProductVariant[]
  features: ProductFeature[]
  rating: number
  reviewCount: number
  active: boolean
  createdAt: string
}

export interface Testimonial {
  id: string
  name: string
  text: string
  avatar: string
  rating: number
}

export interface StatItem {
  id: string
  value: string
  label: string
}

export interface WhyFeature {
  id: string
  text: string
}

export interface ComparisonItem {
  id: string
  title: string
  positive: string
  negative: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface SiteContent {
  urgencyBanner: string
  urgencyBannerActive: boolean
  stockWarning: string
  stockCount: number
  productTitle: string
  productIcon: string
  productDescription: string
  priceLabel: string
  orderFormTitle: string
  orderFormSubtitle: string
  orderButtonText: string
  whatsappNumber: string
  whatsappActive: boolean
  whyTitle: string
  whyFeatures: WhyFeature[]
  whyCta: string
  whyImage: string
  heroTitle: string
  heroText: string
  heroImage: string
  heroCta: string
  deliveryTitle: string
  deliveryText: string
  deliveryImage: string
  deliveryCta: string
  faqTitle: string
  faq: FaqItem[]
  showcaseImage: string
  compareImage: string
  compareTitle: string
  comparisons: ComparisonItem[]
  statsTitle: string
  statsImage: string
  stats: StatItem[]
  testimonials: Testimonial[]
  reviewsMapTitle: string
  urgencyTitle: string
  urgencyCta: string
  primaryColor: string
  buttonColor: string
  facebookPixelId: string
}

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  totalProducts: number
  lowStockProducts: number
}

export type ExpenseCategory =
  | 'stock'
  | 'shipping'
  | 'marketing'
  | 'banking'
  | 'salary'
  | 'rent'
  | 'other'

export interface Expense {
  id: string
  label: string
  category: ExpenseCategory
  amount: number
  date: string
  notes?: string
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  label: string
  category: string
  amount: number
  date: string
  reference?: string
}

export interface MonthlyBreakdown {
  month: string
  label: string
  revenue: number
  expenses: number
  profit: number
}

export type AccountingPeriodPreset =
  | 'today'
  | 'yesterday'
  | 'last-7-days'
  | 'last-30-days'
  | 'this-month'
  | 'last-month'
  | 'this-year'
  | 'all'

export interface AccountingPeriodCustom {
  type: 'custom'
  start: string
  end: string
}

export type AccountingPeriod = AccountingPeriodPreset | AccountingPeriodCustom

export interface AccountingSummary {
  totalRevenue: number
  confirmedRevenue: number
  pendingRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  orderCount: number
  confirmedOrderCount: number
  deliveredCount: number
  monthlyBreakdown: MonthlyBreakdown[]
  expensesByCategory: { category: ExpenseCategory; label: string; amount: number }[]
  recentTransactions: Transaction[]
}
