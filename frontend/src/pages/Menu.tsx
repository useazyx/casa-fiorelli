import { AnimatePresence, motion } from 'framer-motion'
import { Leaf, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DishModal } from '../components/menu/DishModal'
import { MenuCard } from '../components/menu/MenuCard'
import { CardSkeletonGrid } from '../components/ui/Loaders'
import { api } from '../lib/api'
import type { Category, MenuItem } from '../types/api'

export default function MenuPage() {
  const { categoria } = useParams<{ categoria?: string }>()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [onlyVegetarian, setOnlyVegetarian] = useState(false)
  const [selected, setSelected] = useState<MenuItem | null>(null)

  useEffect(() => {
    api.menu.categories().then(setCategories).catch(() => undefined)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    api.menu
      .items({ category: categoria }, controller.signal)
      .then(setItems)
      .catch(() => undefined)
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [categoria])

  // Search and the vegetarian toggle filter client side: the whole menu is small
  // and already in memory, so results appear as the visitor types.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()

    return items.filter((item) => {
      if (onlyVegetarian && !item.vegetarian) return false
      if (!term) return true

      return (
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.includes(term))
      )
    })
  }, [items, search, onlyVegetarian])

  const current = categories.find((category) => category.slug === categoria)

  return (
    <>
      <header className="relative overflow-hidden bg-ink-900 pb-20 pt-40 text-cream-100">
        <img
          src="/img/story/ingredientes.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/80 to-ink-900" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-[0.7rem] uppercase tracking-[0.34em] text-gold-400"
          >
            {current ? current.tagline : 'Il menù della casa'}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="font-display text-5xl text-cream-50 sm:text-6xl"
          >
            {current ? current.name : 'Nosso cardápio'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="mt-5 max-w-2xl text-cream-200/85"
          >
            {current
              ? current.description
              : 'Massas, risotos, assados, combos para dividir e bebidas geladas. Tudo preparado no dia, do jeito que a família Fiorelli aprendeu a fazer.'}
          </motion.p>
        </div>
      </header>

      <div className="sticky top-[72px] z-30 border-b border-ink-800/10 bg-cream-100/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4 lg:px-10">
          <nav className="flex flex-wrap gap-2" aria-label="Categorias do cardápio">
            <CategoryTab active={!categoria} onClick={() => navigate('/cardapio')} label="Tudo" />
            {categories.map((category) => (
              <CategoryTab
                key={category.id}
                active={categoria === category.slug}
                onClick={() => navigate('/cardapio/' + category.slug)}
                label={category.name}
              />
            ))}
          </nav>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOnlyVegetarian((value) => !value)}
              aria-pressed={onlyVegetarian}
              className={
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.7rem] uppercase tracking-[0.16em] transition ' +
                (onlyVegetarian
                  ? 'border-olive-600 bg-olive-600 text-cream-50'
                  : 'border-ink-800/20 text-ink-700 hover:border-olive-400')
              }
            >
              <Leaf size={14} aria-hidden /> Vegetariano
            </button>

            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-700/50"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar no cardápio"
                aria-label="Buscar no cardápio"
                className="w-52 rounded-full border border-ink-800/15 bg-cream-50 py-2.5 pl-10 pr-9 text-sm placeholder:text-ink-700/40 focus:border-chianti-500 focus:outline-none sm:w-64"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/60 hover:text-chianti-600"
                >
                  <X size={15} aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {loading ? (
          <CardSkeletonGrid />
        ) : visible.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl">Nada por aqui com esse nome.</p>
            <p className="mt-3 text-ink-700">Tente outro termo ou peça uma sugestão ao garçom.</p>
          </div>
        ) : (
          <>
            <p className="mb-8 text-[0.7rem] uppercase tracking-[0.2em] text-ink-700/60" aria-live="polite">
              {visible.length} {visible.length === 1 ? 'opção' : 'opções'}
            </p>

            <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {visible.map((item, index) => (
                  <MenuCard key={item.id} item={item} onOpen={setSelected} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </section>

      <DishModal item={selected} onClose={() => setSelected(null)} onSelectRelated={setSelected} />
    </>
  )
}

function CategoryTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={
        'relative rounded-full px-5 py-2 text-[0.72rem] uppercase tracking-[0.18em] transition-colors ' +
        (active ? 'text-cream-50' : 'text-ink-700 hover:text-chianti-600')
      }
    >
      {active && (
        <motion.span
          layoutId="menu-tab"
          className="absolute inset-0 rounded-full bg-chianti-600"
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        />
      )}
      <span className="relative">{label}</span>
    </button>
  )
}
