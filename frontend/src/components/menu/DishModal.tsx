import { motion } from 'framer-motion'
import { Clock, Leaf, Minus, Plus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { api } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import type { MenuItem, MenuItemDetail } from '../../types/api'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface DishModalProps {
  item: MenuItem | null
  onClose: () => void
  onSelectRelated: (item: MenuItem) => void
}

/** The dish opens like a menu card being handed over: photo, price, and its story. */
export function DishModal({ item, onClose, onSelectRelated }: DishModalProps) {
  const [detail, setDetail] = useState<MenuItemDetail | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const { user } = useAuth()
  const { add, busy } = useCart()
  const { notify } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    setDetail(null)
    setQuantity(1)
    setNotes('')

    if (!item) return

    let active = true
    api.menu
      .item(item.slug)
      .then((value) => {
        if (active) setDetail(value)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [item])

  async function handleAdd() {
    if (!item) return

    if (!user) {
      notify('Entre na sua conta para montar o pedido.', 'info')
      navigate('/login', { state: { from: '/cardapio' } })
      return
    }

    try {
      await add(item.id, quantity, notes || undefined)
      notify(item.name + ' foi para o carrinho.')
      onClose()
    } catch {
      notify('Não conseguimos adicionar agora. Tente de novo.', 'error')
    }
  }

  const shown = detail ?? (item as MenuItemDetail | null)

  return (
    <Modal open={Boolean(item)} onClose={onClose} labelledBy="dish-modal-title">
      {shown && (
        <div className="grid lg:grid-cols-2">
          <div className="relative h-64 overflow-hidden lg:h-full lg:min-h-[560px]">
            <motion.img
              src={shown.imageUrl}
              alt={shown.name}
              className="h-full w-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent lg:bg-gradient-to-r" />
          </div>

          <div className="p-8 lg:p-10">
            <p className="eyebrow mb-3">{shown.category.name}</p>

            <h2 id="dish-modal-title" className="font-display text-4xl leading-tight">
              {shown.name}
            </h2>

            <p className="mt-5 text-ink-700">{shown.description}</p>

            {shown.story && (
              <blockquote className="mt-6 border-l-2 border-gold-500 bg-cream-200/60 py-4 pl-5 pr-4">
                <p className="font-display text-lg italic leading-relaxed text-ink-800">{shown.story}</p>
              </blockquote>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-[0.7rem] uppercase tracking-[0.16em] text-ink-700/75">
              <span className="flex items-center gap-1.5">
                <Clock size={14} aria-hidden /> {shown.prepMinutes} min
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} aria-hidden /> {shown.serves === 1 ? '1 pessoa' : shown.serves + ' pessoas'}
              </span>
              {shown.vegetarian && (
                <span className="flex items-center gap-1.5 text-olive-600">
                  <Leaf size={14} aria-hidden /> Vegetariano
                </span>
              )}
            </div>

            <label className="mt-6 block">
              <span className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.22em] text-ink-700">
                Alguma observação para a cozinha?
              </span>
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ex.: sem cebola, ponto da massa..."
                maxLength={240}
                className="w-full rounded-lg border border-ink-800/15 bg-cream-50 px-4 py-3 text-sm placeholder:text-ink-700/40 focus:border-chianti-500 focus:outline-none"
              />
            </label>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-ink-800/10 pt-6">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.2em] text-ink-700/70">Total</p>
                <p className="font-display text-3xl text-chianti-600">{formatPrice(shown.price * quantity)}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-ink-800/15 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    aria-label="Diminuir quantidade"
                    className="rounded-full p-2 transition hover:bg-cream-300/70"
                  >
                    <Minus size={15} aria-hidden />
                  </button>
                  <span className="w-8 text-center font-medium" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(20, value + 1))}
                    aria-label="Aumentar quantidade"
                    className="rounded-full p-2 transition hover:bg-cream-300/70"
                  >
                    <Plus size={15} aria-hidden />
                  </button>
                </div>

                <Button onClick={handleAdd} loading={busy}>
                  Adicionar ao carrinho
                </Button>
              </div>
            </div>

            {detail && detail.related.length > 0 && (
              <div className="mt-8">
                <p className="eyebrow mb-4">Combina bem com</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {detail.related.map((related) => (
                    <button
                      key={related.id}
                      type="button"
                      onClick={() => onSelectRelated(related)}
                      className="group text-left"
                    >
                      <div className="overflow-hidden rounded-lg">
                        <img
                          src={related.imageUrl}
                          alt={related.name}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <p className="mt-2 text-xs leading-snug text-ink-700 group-hover:text-chianti-600">
                        {related.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
