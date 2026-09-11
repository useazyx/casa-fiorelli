export interface Category {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  imageUrl: string
  itemCount: number
}

export interface MenuItem {
  id: string
  slug: string
  name: string
  description: string
  story: string | null
  price: number
  imageUrl: string
  available: boolean
  featured: boolean
  vegetarian: boolean
  serves: number
  prepMinutes: number
  tags: string[]
  category: { id: string; slug: string; name: string }
}

export interface MenuItemDetail extends MenuItem {
  related: MenuItem[]
}

export type Weekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export interface Promotion {
  id: string
  weekday: Weekday
  title: string
  subtitle: string
  description: string
  imageUrl: string
  position: number
}

export interface CartLine {
  id: string
  quantity: number
  notes: string | null
  lineTotal: number
  menuItem: {
    id: string
    slug: string
    name: string
    description: string
    price: number
    imageUrl: string
    available: boolean
    category: string
  }
}

export interface Cart {
  id: string
  items: CartLine[]
  itemCount: number
  subtotal: number
  deliveryFee: number
  total: number
  freeDeliveryThreshold: number
  missingForFreeDelivery: number
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED'

export interface Order {
  id: string
  code: string
  status: OrderStatus
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  notes: string | null
  createdAt: string
  coupon: { code: string; description: string } | null
  address: Address | null
  paymentMethod: Pick<PaymentMethod, 'id' | 'type' | 'label' | 'last4'> | null
  items: Array<{
    id: string
    menuItemId: string | null
    name: string
    imageUrl: string
    unitPrice: number
    quantity: number
    notes: string | null
    lineTotal: number
  }>
}

export interface Address {
  id: string
  label: string
  street: string
  number: string
  complement?: string | null
  district: string
  city: string
  state: string
  zipCode: string
  isDefault?: boolean
}

export type PaymentMethodType = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH'

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  label: string
  holder?: string | null
  last4: string | null
  expMonth?: number | null
  expYear?: number | null
  isDefault?: boolean
}

export interface Profile {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'CUSTOMER' | 'ADMIN'
  avatarUrl: string | null
  balance: number
  memberSince: string
  stats: {
    orders: number
    addresses: number
    reservations: number
    unreadNotifications: number
  }
}

export interface Notification {
  id: string
  title: string
  body: string
  readAt: string | null
  createdAt: string
}

export interface UserCoupon {
  id: string
  code: string
  description: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minSubtotal: number
  expiresAt: string | null
  usedAt: string | null
  usable: boolean
}

export interface Reservation {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  people: number
  notes: string | null
  status: 'REQUESTED' | 'CONFIRMED' | 'SEATED' | 'CANCELLED'
  createdAt: string
}

export interface Availability {
  date: string
  closed: boolean
  slots: Array<{ time: string; seatsLeft: number }>
}
