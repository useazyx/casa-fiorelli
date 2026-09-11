import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CalendarDays, CreditCard, LogOut, MapPin, Package, Ticket, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonLink } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError, api } from '../lib/api'
import { ORDER_STATUS_LABELS, formatDate, formatDateTime, formatPrice } from '../lib/format'
import type { Address, Notification, Order, PaymentMethod, Reservation, UserCoupon } from '../types/api'

type TabId = 'pedidos' | 'reservas' | 'enderecos' | 'pagamentos' | 'notificacoes' | 'cupons'

const TABS: Array<{ id: TabId; label: string; icon: typeof Package }> = [
  { id: 'pedidos', label: 'Pedidos', icon: Package },
  { id: 'reservas', label: 'Reservas', icon: CalendarDays },
  { id: 'enderecos', label: 'Endereços', icon: MapPin },
  { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'cupons', label: 'Cupons', icon: Ticket },
]

const STATUS_TONES: Record<string, string> = {
  PENDING: 'bg-gold-500/20 text-gold-500',
  CONFIRMED: 'bg-olive-400/20 text-olive-600',
  PREPARING: 'bg-terracotta-400/20 text-terracotta-500',
  DELIVERING: 'bg-terracotta-500/20 text-terracotta-500',
  COMPLETED: 'bg-olive-600/20 text-olive-600',
  CANCELLED: 'bg-ink-800/10 text-ink-700',
}

export default function Profile() {
  const { user, logout, refresh } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const [tab, setTab] = useState<TabId>('pedidos')
  const [orders, setOrders] = useState<Order[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [coupons, setCoupons] = useState<UserCoupon[]>([])

  useEffect(() => {
    void Promise.allSettled([
      api.orders.list(),
      api.reservations.mine(),
      api.profile.addresses(),
      api.profile.paymentMethods(),
      api.profile.notifications(),
      api.profile.coupons(),
    ]).then((results) => {
      const [ordersResult, reservationsResult, addressResult, methodResult, notificationResult, couponResult] =
        results

      if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value)
      if (reservationsResult.status === 'fulfilled') setReservations(reservationsResult.value)
      if (addressResult.status === 'fulfilled') setAddresses(addressResult.value)
      if (methodResult.status === 'fulfilled') setMethods(methodResult.value)
      if (notificationResult.status === 'fulfilled') setNotifications(notificationResult.value)
      if (couponResult.status === 'fulfilled') setCoupons(couponResult.value)
    })
  }, [])

  async function cancelOrder(id: string) {
    try {
      const updated = await api.orders.cancel(id)
      setOrders((current) => current.map((order) => (order.id === id ? updated : order)))
      notify('Pedido cancelado.', 'info')
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'Não foi possível cancelar.', 'error')
    }
  }

  async function markAllRead() {
    await api.profile.readAllNotifications()
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, readAt: notification.readAt ?? new Date().toISOString() })),
    )
    await refresh()
  }

  async function removeAddress(id: string) {
    await api.profile.deleteAddress(id)
    setAddresses((current) => current.filter((address) => address.id !== id))
    notify('Endereço removido.', 'info')
  }

  async function removePaymentMethod(id: string) {
    await api.profile.deletePaymentMethod(id)
    setMethods((current) => current.filter((method) => method.id !== id))
    notify('Forma de pagamento removida.', 'info')
  }

  if (!user) return null

  const unread = notifications.filter((notification) => !notification.readAt).length

  return (
    <>
      <header className="bg-ink-900 pb-20 pt-40 text-cream-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="mb-3 text-[0.7rem] uppercase tracking-[0.34em] text-gold-400">Il tuo posto a tavola</p>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-5xl text-cream-50">Olá, {user.name.split(' ')[0]}!</h1>
              <p className="mt-3 text-cream-200/80">
                Cliente da casa desde {formatDate(user.memberSince)} · {user.email}
              </p>
            </div>

            <Button
              variant="secondary"
              className="border-cream-200/40 text-cream-100 hover:border-gold-400 hover:text-gold-400"
              onClick={async () => {
                await logout()
                notify('Até logo! A mesa fica guardada.', 'info')
                navigate('/')
              }}
            >
              <LogOut size={15} aria-hidden />
              Sair
            </Button>
          </div>

          <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Pedidos feitos" value={String(user.stats.orders)} />
            <Stat label="Endereços salvos" value={String(user.stats.addresses)} />
            <Stat label="Reservas" value={String(user.stats.reservations)} />
            <Stat label="Saldo em conta" value={formatPrice(user.balance)} />
          </dl>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <nav className="mb-10 flex flex-wrap gap-2" aria-label="Seções do perfil">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = tab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={
                  'relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.16em] transition-colors ' +
                  (active ? 'text-cream-50' : 'text-ink-700 hover:text-chianti-600')
                }
              >
                {active && (
                  <motion.span
                    layoutId="profile-tab"
                    className="absolute inset-0 rounded-full bg-chianti-600"
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon size={15} aria-hidden />
                  {item.label}
                  {item.id === 'notificacoes' && unread > 0 && (
                    <span className="rounded-full bg-gold-500 px-1.5 text-[0.6rem] text-ink-900">{unread}</span>
                  )}
                </span>
              </button>
            )
          })}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'pedidos' && (
              <div className="space-y-5">
                {orders.length === 0 && <Empty text="Você ainda não fez nenhum pedido." action />}

                {orders.map((order) => (
                  <article key={order.id} className="rounded-2xl bg-cream-50 p-6 shadow-warm sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-2xl">{order.code}</p>
                        <p className="mt-1 text-sm text-ink-700/75">{formatDateTime(order.createdAt)}</p>
                      </div>

                      <span
                        className={
                          'rounded-full px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] ' +
                          (STATUS_TONES[order.status] ?? 'bg-ink-800/10 text-ink-700')
                        }
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>

                    <ul className="mt-6 flex flex-wrap gap-4">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="h-14 w-14 rounded-lg object-cover"
                            loading="lazy"
                          />
                          <span className="text-sm">
                            <span className="block">{item.name}</span>
                            <span className="text-ink-700/70">
                              {item.quantity}× {formatPrice(item.unitPrice)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink-800/10 pt-5">
                      <div className="text-sm text-ink-700/80">
                        {order.discount > 0 && <span className="mr-4">Desconto {formatPrice(order.discount)}</span>}
                        <span>Entrega {order.deliveryFee === 0 ? 'grátis' : formatPrice(order.deliveryFee)}</span>
                      </div>

                      <div className="flex items-center gap-5">
                        <span className="font-display text-2xl text-chianti-600">{formatPrice(order.total)}</span>

                        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                          <Button variant="ghost" size="sm" onClick={() => cancelOrder(order.id)}>
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {tab === 'reservas' && (
              <div className="grid gap-5 sm:grid-cols-2">
                {reservations.length === 0 && <Empty text="Nenhuma reserva por aqui ainda." />}

                {reservations.map((reservation) => (
                  <article key={reservation.id} className="rounded-2xl bg-cream-50 p-6 shadow-warm">
                    <p className="font-display text-2xl">
                      {new Date(reservation.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} · {reservation.time}
                    </p>
                    <p className="mt-2 text-sm text-ink-700">
                      {reservation.people} pessoa(s) · {reservation.status === 'REQUESTED' ? 'Aguardando confirmação' : reservation.status}
                    </p>
                    {reservation.notes && <p className="mt-3 text-sm italic text-terracotta-500">{reservation.notes}</p>}
                  </article>
                ))}
              </div>
            )}

            {tab === 'enderecos' && (
              <div className="grid gap-5 sm:grid-cols-2">
                {addresses.length === 0 && <Empty text="Nenhum endereço salvo." />}

                {addresses.map((address) => (
                  <article key={address.id} className="relative rounded-2xl bg-cream-50 p-6 shadow-warm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-xl">
                          {address.label}
                          {address.isDefault && (
                            <span className="ml-3 rounded-full bg-olive-600/15 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-olive-600">
                              Padrão
                            </span>
                          )}
                        </p>
                        <p className="mt-2 text-sm text-ink-700">
                          {address.street}, {address.number}
                          {address.complement ? ', ' + address.complement : ''}
                          <br />
                          {address.district} · {address.city}/{address.state} · {address.zipCode}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAddress(address.id)}
                        aria-label={'Remover endereço ' + address.label}
                        className="rounded-full p-2 text-ink-700/60 transition hover:bg-chianti-600/10 hover:text-chianti-600"
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {tab === 'pagamentos' && (
              <div className="grid gap-5 sm:grid-cols-2">
                {methods.length === 0 && <Empty text="Nenhuma forma de pagamento salva." />}

                {methods.map((method) => (
                  <article key={method.id} className="flex items-start justify-between gap-4 rounded-2xl bg-cream-50 p-6 shadow-warm">
                    <div>
                      <p className="font-display text-xl">{method.label}</p>
                      <p className="mt-2 text-sm text-ink-700/80">
                        {method.holder ? method.holder + ' · ' : ''}
                        {method.last4 ? '•••• ' + method.last4 : 'Sem cartão vinculado'}
                        {method.expMonth ? ' · ' + method.expMonth + '/' + method.expYear : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removePaymentMethod(method.id)}
                      aria-label={'Remover ' + method.label}
                      className="rounded-full p-2 text-ink-700/60 transition hover:bg-chianti-600/10 hover:text-chianti-600"
                    >
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </article>
                ))}
              </div>
            )}

            {tab === 'notificacoes' && (
              <div>
                {unread > 0 && (
                  <div className="mb-5 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={markAllRead}>
                      Marcar todas como lidas
                    </Button>
                  </div>
                )}

                <ul className="space-y-4">
                  {notifications.length === 0 && <Empty text="Nenhuma notificação por enquanto." />}

                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={
                        'rounded-2xl border-l-4 bg-cream-50 p-6 shadow-warm ' +
                        (notification.readAt ? 'border-ink-800/15' : 'border-chianti-600')
                      }
                    >
                      <p className="font-display text-xl">{notification.title}</p>
                      <p className="mt-2 text-sm text-ink-700">{notification.body}</p>
                      <p className="mt-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink-700/55">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === 'cupons' && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {coupons.length === 0 && <Empty text="Nenhum cupom disponível agora." />}

                {coupons.map((coupon) => (
                  <article
                    key={coupon.id}
                    className={
                      'relative overflow-hidden rounded-2xl p-6 ' +
                      (coupon.usable ? 'bg-chianti-600 text-cream-50' : 'bg-cream-200 text-ink-700/70')
                    }
                  >
                    <p className="font-display text-3xl">{coupon.code}</p>
                    <p className="mt-3 text-sm opacity-90">{coupon.description}</p>

                    <p className="mt-5 text-[0.66rem] uppercase tracking-[0.16em] opacity-80">
                      {coupon.usable
                        ? coupon.minSubtotal > 0
                          ? 'Válido a partir de ' + formatPrice(coupon.minSubtotal)
                          : 'Disponível'
                        : 'Já utilizado'}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cream-200/15 bg-cream-200/5 p-6">
      <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-cream-200/65">{label}</dt>
      <dd className="mt-2 font-display text-3xl text-gold-400">{value}</dd>
    </div>
  )
}

function Empty({ text, action = false }: { text: string; action?: boolean }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-ink-800/20 p-12 text-center">
      <UserRound size={32} className="mx-auto mb-4 text-ink-700/40" aria-hidden />
      <p className="text-ink-700">{text}</p>
      {action && (
        <div className="mt-6">
          <ButtonLink to="/cardapio" variant="secondary" size="sm">
            Ver o cardápio
          </ButtonLink>
        </div>
      )}
    </div>
  )
}
