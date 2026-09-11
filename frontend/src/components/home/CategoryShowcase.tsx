import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Category } from '../../types/api'

/** The three menu sections (pratos, combos, bebidas), same as the old site. */
export function CategoryShowcase({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null

  return (
    <section className="bg-ink-900 py-24 text-cream-100" aria-labelledby="categories-title">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-[0.7rem] uppercase tracking-[0.34em] text-gold-400">Il menù</p>
          <h2 id="categories-title" className="font-display text-4xl text-cream-50 sm:text-5xl">
            Escolha por onde começar
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={'/cardapio/' + category.slug}
                className="group relative flex h-[26rem] flex-col justify-end overflow-hidden rounded-2xl"
              >
                <img
                  src={category.imageUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/45 to-transparent" />

                <div className="relative p-8">
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gold-400">{category.tagline}</p>
                  <h3 className="mt-3 font-display text-3xl text-cream-50">{category.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream-200/80">{category.description}</p>

                  <span className="mt-5 inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-cream-100">
                    {category.itemCount} opções
                    <ArrowRight
                      size={16}
                      aria-hidden
                      className="transition-transform duration-500 group-hover:translate-x-1.5"
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
