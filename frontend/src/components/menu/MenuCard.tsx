import { motion } from 'framer-motion'
import { Clock, Leaf, Plus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../lib/format'
import type { MenuItem } from '../../types/api'

interface MenuCardProps {
  item: MenuItem
  onOpen?: (item: MenuItem) => void
  index?: number
}

export function MenuCard({ item, onOpen, index = 0 }: MenuCardProps) {
  const { user } = useAuth()
  const { add, busy } = useCart()
  const { notify } = useToast()
  const navigate = useNavigate()

  async function handleAdd(event: React.MouseEvent) {
    event.stopPropagation()

    if (!user) {
      notify('Entre na sua conta para montar o pedido.', 'info')
      navigate('/login', { state: { from: '/cardapio' } })
      return
    }

    try {
      await add(item.id)
      notify(item.name + ' foi para o carrinho.')
    } catch {
      notify('Não conseguimos adicionar agora. Tente de novo.', 'error')
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-cream-50 shadow-warm transition-shadow duration-500 hover:shadow-plate"
    >
      <button
        type="button"
        onClick={() => onOpen?.(item)}
        className="relative block aspect-[4/3] w-full overflow-hidden"
        aria-label={'Ver detalhes de ' + item.name}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        />

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-ink-900/75 to-transparent p-4 text-cream-100">
          {item.vegetarian && (
            <span className="flex items-center gap-1 rounded-full bg-olive-600/90 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.14em]">
              <Leaf size={12} aria-hidden /> Vegetariano
            </span>
          )}
          {item.featured && (
            <span className="rounded-full bg-gold-500/95 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-ink-900">
              Da casa
            </span>
          )}
        </div>
      </button>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl leading-snug">{item.name}</h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-700">{item.description}</p>

        <div className="mt-4 flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.16em] text-ink-700/70">
          <span className="flex items-center gap-1.5">
            <Clock size={13} aria-hidden /> {item.prepMinutes} min
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} aria-hidden /> {item.serves === 1 ? '1 pessoa' : item.serves + ' pessoas'}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-ink-800/10 pt-5">
          <span className="font-display text-2xl text-chianti-600">{formatPrice(item.price)}</span>

          <motion.button
            type="button"
            onClick={handleAdd}
            disabled={busy}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 rounded-full bg-chianti-600 px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-cream-50 transition-colors hover:bg-chianti-500 disabled:opacity-60"
          >
            <Plus size={14} aria-hidden />
            Adicionar
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
