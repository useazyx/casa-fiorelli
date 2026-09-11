import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { Cart } from '../types/api'
import { useAuth } from './AuthContext'

interface CartContextValue {
  cart: Cart | null
  itemCount: number
  busy: boolean
  add: (menuItemId: string, quantity?: number, notes?: string) => Promise<void>
  update: (itemId: string, quantity: number) => Promise<void>
  remove: (itemId: string) => Promise<void>
  clear: () => Promise<void>
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null)
      return
    }

    setCart(await api.cart.get())
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  /** Every mutation returns the whole cart, so totals never drift from the server. */
  const run = useCallback(async (operation: () => Promise<Cart>) => {
    setBusy(true)
    try {
      setCart(await operation())
    } finally {
      setBusy(false)
    }
  }, [])

  const add = useCallback(
    (menuItemId: string, quantity = 1, notes?: string) => run(() => api.cart.add(menuItemId, quantity, notes)),
    [run],
  )

  const update = useCallback(
    (itemId: string, quantity: number) => run(() => api.cart.update(itemId, quantity)),
    [run],
  )

  const remove = useCallback((itemId: string) => run(() => api.cart.remove(itemId)), [run])

  const clear = useCallback(() => run(() => api.cart.clear()), [run])

  const value = useMemo(
    () => ({ cart, itemCount: cart?.itemCount ?? 0, busy, add, update, remove, clear, refresh }),
    [cart, busy, add, update, remove, clear, refresh],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) throw new Error('useCart precisa estar dentro de CartProvider.')

  return context
}
