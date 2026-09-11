import { motion } from 'framer-motion'
import { CheckCircle2, CreditCard, MapPin, Plus, Ticket } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, ButtonLink } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Field'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { ApiError, api } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { Address, Order, PaymentMethod, UserCoupon } from '../types/api'

const EMPTY_ADDRESS = {
  label: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: 'Taubaté',
  state: 'SP',
  zipCode: '',
}

export default function Checkout() {
  const { cart, refresh } = useCart()
  const { notify } = useToast()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [coupons, setCoupons] = useState<UserCoupon[]>([])

  const [addressId, setAddressId] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [notes, setNotes] = useState('')

  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState<Order | null>(null)

  useEffect(() => {
    void Promise.allSettled([api.profile.addresses(), api.profile.paymentMethods(), api.profile.coupons()]).then(
      ([addressResult, methodResult, couponResult]) => {
        if (addressResult.status === 'fulfilled') {
          setAddresses(addressResult.value)
          setAddressId(addressResult.value.find((address) => address.isDefault)?.id ?? addressResult.value[0]?.id ?? '')
          setShowAddressForm(addressResult.value.length === 0)
        }

        if (methodResult.status === 'fulfilled') {
          setMethods(methodResult.value)
          setPaymentMethodId(methodResult.value.find((method) => method.isDefault)?.id ?? methodResult.value[0]?.id ?? '')
        }

        if (couponResult.status === 'fulfilled') setCoupons(couponResult.value.filter((coupon) => coupon.usable))
      },
    )
  }, [])

  async function saveAddress(event: FormEvent) {
    event.preventDefault()

    try {
      const created = await api.profile.createAddress({ ...newAddress, isDefault: addresses.length === 0 })

      setAddresses((current) => [...current, created])
      setAddressId(created.id)
      setNewAddress(EMPTY_ADDRESS)
      setShowAddressForm(false)
      notify('Endereço salvo.')
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'Não conseguimos salvar o endereço.', 'error')
    }
  }

  async function placeOrder() {
    setError('')

    if (!addressId) {
      setError('Escolha ou cadastre um endereço de entrega.')
      return
    }

    setPlacing(true)

    try {
      const order = await api.orders.create({
        addressId,
        paymentMethodId: paymentMethodId || undefined,
        couponCode: couponCode || undefined,
        notes: notes || undefined,
      })

      await refresh()
      setPlaced(order)
      notify('Pedido ' + order.code + ' confirmado!')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não conseguimos fechar o pedido agora.')
    } finally {
      setPlacing(false)
    }
  }

  if (placed) {
    return (
      <section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 py-32 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="mb-8 rounded-full bg-olive-600/15 p-6 text-olive-600"
        >
          <CheckCircle2 size={54} aria-hidden />
        </motion.div>

        <p className="eyebrow mb-3">Grazie mille</p>
        <h1 className="font-display text-4xl sm:text-5xl">Pedido {placed.code} confirmado</h1>

        <p className="mt-5 text-ink-700">
          Já estamos preparando tudo na cozinha. O total foi de{' '}
          <strong className="text-chianti-600">{formatPrice(placed.total)}</strong>
          {placed.discount > 0 && ', com ' + formatPrice(placed.discount) + ' de desconto'}.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/perfil" size="lg">
            Acompanhar meus pedidos
          </ButtonLink>
          <ButtonLink to="/cardapio" size="lg" variant="secondary">
            Voltar ao cardápio
          </ButtonLink>
        </div>
      </section>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-4xl">Nada para finalizar</h1>
        <p className="mt-4 text-ink-700">Seu carrinho está vazio.</p>
        <div className="mt-10">
          <ButtonLink to="/cardapio" size="lg">
            Ver o cardápio
          </ButtonLink>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-36 lg:px-10">
      <p className="eyebrow mb-3">Ultimo passo</p>
      <h1 className="mb-12 font-display text-4xl sm:text-5xl">Finalizar pedido</h1>

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section className="rounded-2xl bg-cream-50 p-8 shadow-warm" aria-labelledby="address-title">
            <h2 id="address-title" className="mb-6 flex items-center gap-2 font-display text-2xl">
              <MapPin size={20} className="text-chianti-600" aria-hidden />
              Endereço de entrega
            </h2>

            {addresses.length > 0 && (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={
                      'flex cursor-pointer gap-4 rounded-xl border p-4 transition ' +
                      (addressId === address.id
                        ? 'border-chianti-600 bg-chianti-600/5'
                        : 'border-ink-800/12 hover:border-ink-800/25')
                    }
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === address.id}
                      onChange={() => setAddressId(address.id)}
                      className="mt-1 accent-[#8e1c1c]"
                    />
                    <span className="text-sm">
                      <strong className="block font-display text-lg">{address.label}</strong>
                      {address.street}, {address.number}
                      {address.complement ? ', ' + address.complement : ''}
                      <span className="block text-ink-700/75">
                        {address.district} · {address.city}/{address.state} · {address.zipCode}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {showAddressForm ? (
              <form onSubmit={saveAddress} className="mt-6 grid gap-5 border-t border-ink-800/10 pt-6 sm:grid-cols-2">
                <Input
                  label="Apelido"
                  value={newAddress.label}
                  onChange={(event) => setNewAddress({ ...newAddress, label: event.target.value })}
                  placeholder="Casa, trabalho..."
                  required
                />
                <Input
                  label="CEP"
                  value={newAddress.zipCode}
                  onChange={(event) => setNewAddress({ ...newAddress, zipCode: event.target.value })}
                  placeholder="12010-000"
                  required
                />
                <Input
                  label="Rua"
                  value={newAddress.street}
                  onChange={(event) => setNewAddress({ ...newAddress, street: event.target.value })}
                  className="sm:col-span-2"
                  required
                />
                <Input
                  label="Número"
                  value={newAddress.number}
                  onChange={(event) => setNewAddress({ ...newAddress, number: event.target.value })}
                  required
                />
                <Input
                  label="Complemento"
                  value={newAddress.complement}
                  onChange={(event) => setNewAddress({ ...newAddress, complement: event.target.value })}
                />
                <Input
                  label="Bairro"
                  value={newAddress.district}
                  onChange={(event) => setNewAddress({ ...newAddress, district: event.target.value })}
                  required
                />
                <Input
                  label="Cidade"
                  value={newAddress.city}
                  onChange={(event) => setNewAddress({ ...newAddress, city: event.target.value })}
                  required
                />
                <Input
                  label="Estado"
                  value={newAddress.state}
                  onChange={(event) => setNewAddress({ ...newAddress, state: event.target.value })}
                  maxLength={2}
                  required
                />

                <div className="flex gap-3 sm:col-span-2">
                  <Button type="submit">Salvar endereço</Button>
                  {addresses.length > 0 && (
                    <Button type="button" variant="ghost" onClick={() => setShowAddressForm(false)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="mt-5 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.18em] text-chianti-600"
              >
                <Plus size={15} aria-hidden /> Adicionar outro endereço
              </button>
            )}
          </section>

          <section className="rounded-2xl bg-cream-50 p-8 shadow-warm" aria-labelledby="payment-title">
            <h2 id="payment-title" className="mb-6 flex items-center gap-2 font-display text-2xl">
              <CreditCard size={20} className="text-chianti-600" aria-hidden />
              Pagamento
            </h2>

            {methods.length > 0 ? (
              <Select
                label="Forma de pagamento"
                value={paymentMethodId}
                onChange={(event) => setPaymentMethodId(event.target.value)}
              >
                {methods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </Select>
            ) : (
              <p className="text-sm text-ink-700">
                Nenhuma forma de pagamento salva. Você pode cadastrar uma no{' '}
                <Link to="/perfil" className="link-underline text-chianti-600">
                  seu perfil
                </Link>{' '}
                ou pagar na entrega.
              </p>
            )}

            <Textarea
              label="Observações para a cozinha"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ponto da massa, campainha quebrada, deixar na portaria..."
              className="mt-6"
            />
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-2xl bg-ink-900 p-8 text-cream-100">
            <h2 className="font-display text-2xl text-cream-50">Seu pedido</h2>

            <ul className="mt-6 space-y-3 text-sm">
              {cart.items.map((line) => (
                <li key={line.id} className="flex justify-between gap-4">
                  <span className="text-cream-200/80">
                    {line.quantity}× {line.menuItem.name}
                  </span>
                  <span className="shrink-0">{formatPrice(line.lineTotal)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-cream-200/15 pt-6">
              <label className="mb-2 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-cream-200/70">
                <Ticket size={14} aria-hidden /> Cupom de desconto
              </label>

              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                placeholder="BENVENUTO10"
                className="w-full rounded-lg border border-cream-200/20 bg-cream-200/5 px-4 py-3 text-sm text-cream-50 placeholder:text-cream-200/35 focus:border-gold-400 focus:outline-none"
              />

              {coupons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {coupons.map((coupon) => (
                    <button
                      key={coupon.id}
                      type="button"
                      onClick={() => setCouponCode(coupon.code)}
                      className="rounded-full border border-gold-400/50 px-3 py-1 text-[0.66rem] uppercase tracking-[0.14em] text-gold-400 transition hover:bg-gold-400 hover:text-ink-900"
                    >
                      {coupon.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <dl className="mt-6 space-y-3 border-t border-cream-200/15 pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-cream-200/75">Subtotal</dt>
                <dd>{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cream-200/75">Entrega</dt>
                <dd>{cart.deliveryFee === 0 ? 'Grátis' : formatPrice(cart.deliveryFee)}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-end justify-between border-t border-cream-200/15 pt-5">
              <span className="text-[0.7rem] uppercase tracking-[0.22em] text-cream-200/70">Total</span>
              <span className="font-display text-3xl text-gold-400">{formatPrice(cart.total)}</span>
            </div>

            {error && (
              <p className="mt-5 rounded-lg bg-chianti-500/20 px-4 py-3 text-sm text-cream-50" role="alert">
                {error}
              </p>
            )}

            <Button onClick={placeOrder} size="lg" variant="gold" loading={placing} className="mt-7 w-full">
              Confirmar pedido
            </Button>

            <p className="mt-4 text-center text-[0.66rem] uppercase tracking-[0.16em] text-cream-200/55">
              O desconto do cupom aparece na confirmação
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
