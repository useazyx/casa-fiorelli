import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, ButtonLink } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../lib/format'

export default function CartPage() {
  const { user, loading } = useAuth()
  const { cart, busy, update, remove, clear } = useCart()
  const { notify } = useToast()
  const navigate = useNavigate()

  if (loading) return <div className="min-h-[60vh]" />

  if (!user) {
    return (
      <EmptyState
        title="Entre para ver o seu carrinho"
        text="Sua conta guarda o pedido enquanto você escolhe o resto do cardápio."
        action={
          <ButtonLink to="/login" size="lg">
            Entrar na minha conta
          </ButtonLink>
        }
      />
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Seu carrinho está vazio"
        text="Que tal começar pelo destaque do dia? A cozinha já está aquecida."
        action={
          <ButtonLink to="/cardapio" size="lg">
            Ver o cardápio
          </ButtonLink>
        }
      />
    )
  }

  const progress = Math.min(100, (cart.subtotal / cart.freeDeliveryThreshold) * 100)

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-36 lg:px-10">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Il tuo ordine</p>
          <h1 className="font-display text-4xl sm:text-5xl">Seu carrinho</h1>
        </div>

        <button
          type="button"
          onClick={async () => {
            await clear()
            notify('Carrinho esvaziado.', 'info')
          }}
          className="text-[0.72rem] uppercase tracking-[0.18em] text-ink-700/70 transition hover:text-chianti-600"
        >
          Esvaziar carrinho
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ul className="space-y-5">
          <AnimatePresence mode="popLayout">
            {cart.items.map((line) => (
              <motion.li
                key={line.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-5 overflow-hidden rounded-2xl bg-cream-50 p-5 shadow-warm"
              >
                <Link to="/cardapio" className="shrink-0">
                  <img
                    src={line.menuItem.imageUrl}
                    alt={line.menuItem.name}
                    className="h-28 w-28 rounded-xl object-cover sm:h-32 sm:w-32"
                    loading="lazy"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-display text-xl leading-snug">{line.menuItem.name}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-ink-700/80">{line.menuItem.description}</p>
                      {line.notes && (
                        <p className="mt-2 text-xs italic text-terracotta-500">Obs.: {line.notes}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      aria-label={'Remover ' + line.menuItem.name}
                      className="shrink-0 rounded-full p-2 text-ink-700/60 transition hover:bg-chianti-600/10 hover:text-chianti-600"
                    >
                      <Trash2 size={17} aria-hidden />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                    <div className="flex items-center gap-1 rounded-full border border-ink-800/15 p-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => update(line.id, line.quantity - 1)}
                        aria-label="Diminuir quantidade"
                        className="rounded-full p-1.5 transition hover:bg-cream-300/70 disabled:opacity-50"
                      >
                        <Minus size={14} aria-hidden />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{line.quantity}</span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => update(line.id, line.quantity + 1)}
                        aria-label="Aumentar quantidade"
                        className="rounded-full p-1.5 transition hover:bg-cream-300/70 disabled:opacity-50"
                      >
                        <Plus size={14} aria-hidden />
                      </button>
                    </div>

                    <p className="font-display text-2xl text-chianti-600">{formatPrice(line.lineTotal)}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-2xl bg-ink-900 p-8 text-cream-100">
            <h2 className="font-display text-2xl text-cream-50">Resumo do pedido</h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-cream-200/75">Subtotal</dt>
                <dd>{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cream-200/75">Entrega</dt>
                <dd>{cart.deliveryFee === 0 ? 'Grátis' : formatPrice(cart.deliveryFee)}</dd>
              </div>
            </dl>

            {cart.missingForFreeDelivery > 0 && (
              <div className="mt-6">
                <p className="text-xs text-cream-200/75">
                  Faltam <strong className="text-gold-400">{formatPrice(cart.missingForFreeDelivery)}</strong>{' '}
                  para a entrega sair por nossa conta.
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream-200/15">
                  <motion.div
                    className="h-full rounded-full bg-gold-500"
                    initial={{ width: 0 }}
                    animate={{ width: progress + '%' }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex items-end justify-between border-t border-cream-200/15 pt-6">
              <span className="text-[0.7rem] uppercase tracking-[0.22em] text-cream-200/70">Total</span>
              <span className="font-display text-3xl text-gold-400">{formatPrice(cart.total)}</span>
            </div>

            <Button onClick={() => navigate('/checkout')} size="lg" className="mt-8 w-full" variant="gold">
              Finalizar pedido
            </Button>

            <Link
              to="/cardapio"
              className="mt-4 block text-center text-[0.72rem] uppercase tracking-[0.18em] text-cream-200/70 transition hover:text-cream-50"
            >
              Continuar escolhendo
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}

function EmptyState({ title, text, action }: { title: string; text: string; action: React.ReactNode }) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-8 rounded-full bg-cream-300/60 p-6 text-ink-700">
        <ShoppingBag size={44} aria-hidden />
      </div>
      <h1 className="font-display text-4xl">{title}</h1>
      <p className="mt-4 text-ink-700">{text}</p>
      <div className="mt-10">{action}</div>
    </section>
  )
}
