import type {
  Address,
  Availability,
  Cart,
  Category,
  MenuItem,
  MenuItemDetail,
  Notification,
  Order,
  PaymentMethod,
  Profile,
  Promotion,
  Reservation,
  UserCoupon,
} from '../types/api'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
const TOKEN_KEY = 'casa-fiorelli:token'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly issues?: Record<string, string[]>

  constructor(message: string, status: number, code?: string, issues?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.issues = issues
  }

  /** First validation message for a field, ready to sit under an input. */
  issueFor(field: string): string | undefined {
    return this.issues?.[field]?.[0]
  }
}

export const tokenStorage = {
  get: () => (typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = tokenStorage.get()

  const response = await fetch(BASE_URL + path, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: 'include',
    signal: options.signal,
  })

  if (response.status === 204) return undefined as T

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(
      payload.error ?? 'Não conseguimos falar com a cozinha. Tente novamente.',
      response.status,
      payload.code,
      payload.issues,
    )
  }

  return payload as T
}

export type MenuFilters = {
  category?: string
  search?: string
  featured?: boolean
  vegetarian?: boolean
  maxPrice?: number
}

function toQuery(filters: Record<string, unknown>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }

  const query = params.toString()
  return query ? '?' + query : ''
}

export const api = {
  menu: {
    categories: () => request<{ categories: Category[] }>('/menu/categories').then((r) => r.categories),
    items: (filters: MenuFilters = {}, signal?: AbortSignal) =>
      request<{ items: MenuItem[] }>('/menu/items' + toQuery(filters), { signal }).then((r) => r.items),
    item: (slug: string) => request<{ item: MenuItemDetail }>('/menu/items/' + slug).then((r) => r.item),
    promotions: () => request<{ promotions: Promotion[] }>('/menu/promotions').then((r) => r.promotions),
  },

  auth: {
    register: (body: { name: string; email: string; phone?: string; password: string }) =>
      request<{ user: Profile; token: string }>('/auth/register', { method: 'POST', body }),
    login: (body: { email: string; password: string }) =>
      request<{ user: Profile; token: string }>('/auth/login', { method: 'POST', body }),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    me: () => request<{ user: Profile }>('/auth/me').then((r) => r.user),
    forgotPassword: (email: string) =>
      request<{ message: string; token?: string | null }>('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      }),
    resetPassword: (body: { token: string; password: string }) =>
      request<{ success: boolean }>('/auth/reset-password', { method: 'POST', body }),
  },

  cart: {
    get: () => request<{ cart: Cart }>('/cart').then((r) => r.cart),
    add: (menuItemId: string, quantity = 1, notes?: string) =>
      request<{ cart: Cart }>('/cart/items', { method: 'POST', body: { menuItemId, quantity, notes } }).then(
        (r) => r.cart,
      ),
    update: (itemId: string, quantity: number, notes?: string) =>
      request<{ cart: Cart }>('/cart/items/' + itemId, { method: 'PATCH', body: { quantity, notes } }).then(
        (r) => r.cart,
      ),
    remove: (itemId: string) =>
      request<{ cart: Cart }>('/cart/items/' + itemId, { method: 'DELETE' }).then((r) => r.cart),
    clear: () => request<{ cart: Cart }>('/cart', { method: 'DELETE' }).then((r) => r.cart),
  },

  orders: {
    create: (body: { addressId?: string; paymentMethodId?: string; couponCode?: string; notes?: string }) =>
      request<{ order: Order }>('/orders', { method: 'POST', body }).then((r) => r.order),
    list: () => request<{ orders: Order[] }>('/orders').then((r) => r.orders),
    get: (id: string) => request<{ order: Order }>('/orders/' + id).then((r) => r.order),
    cancel: (id: string) =>
      request<{ order: Order }>('/orders/' + id + '/cancel', { method: 'PATCH' }).then((r) => r.order),
  },

  reservations: {
    availability: (date: string) => request<Availability>('/reservations/availability?date=' + date),
    create: (body: {
      name: string
      email: string
      phone: string
      date: string
      time: string
      people: number
      notes?: string
    }) => request<{ reservation: Reservation }>('/reservations', { method: 'POST', body }).then((r) => r.reservation),
    mine: () => request<{ reservations: Reservation[] }>('/reservations/me').then((r) => r.reservations),
  },

  contact: {
    send: (body: { name: string; email: string; subject?: string; message: string }) =>
      request<{ message: { id: string } }>('/contact', { method: 'POST', body }),
  },

  profile: {
    get: () => request<{ profile: Profile }>('/profile').then((r) => r.profile),
    update: (body: { name?: string; phone?: string | null }) =>
      request<{ profile: Profile }>('/profile', { method: 'PATCH', body }).then((r) => r.profile),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      request<{ success: boolean }>('/profile/password', { method: 'PATCH', body }),

    addresses: () => request<{ addresses: Address[] }>('/profile/addresses').then((r) => r.addresses),
    createAddress: (body: Omit<Address, 'id'>) =>
      request<{ address: Address }>('/profile/addresses', { method: 'POST', body }).then((r) => r.address),
    deleteAddress: (id: string) => request<void>('/profile/addresses/' + id, { method: 'DELETE' }),

    paymentMethods: () =>
      request<{ paymentMethods: PaymentMethod[] }>('/profile/payment-methods').then((r) => r.paymentMethods),
    createPaymentMethod: (body: Partial<PaymentMethod> & { type: PaymentMethod['type']; label: string }) =>
      request<{ paymentMethod: PaymentMethod }>('/profile/payment-methods', { method: 'POST', body }).then(
        (r) => r.paymentMethod,
      ),
    deletePaymentMethod: (id: string) => request<void>('/profile/payment-methods/' + id, { method: 'DELETE' }),

    notifications: () =>
      request<{ notifications: Notification[] }>('/profile/notifications').then((r) => r.notifications),
    readAllNotifications: () =>
      request<{ success: boolean }>('/profile/notifications/read-all', { method: 'PATCH' }),

    coupons: () => request<{ coupons: UserCoupon[] }>('/profile/coupons').then((r) => r.coupons),
  },
}
