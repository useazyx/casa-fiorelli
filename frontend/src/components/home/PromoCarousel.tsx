import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { WEEKDAY_LABELS } from '../../lib/format'
import type { Promotion } from '../../types/api'
import { ButtonLink } from '../ui/Button'

/** The weekday specials the house has always printed, now as a live carousel. */
export function PromoCarousel({ promotions }: { promotions: Promotion[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', duration: 32 },
    [Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true })],
  )

  const [selected, setSelected] = useState(0)

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  if (promotions.length === 0) return null

  return (
    <section className="bg-paper py-24" aria-labelledby="promos-title">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">La settimana</p>
            <h2 id="promos-title" className="font-display text-4xl sm:text-5xl">
              Destaques da semana
            </h2>
          </div>

          <p className="max-w-md text-sm text-ink-700">
            Cada dia tem o seu prato de honra, com preço de casa. De terça a domingo, um clássico diferente sai
            da nossa cozinha.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {promotions.map((promotion, index) => (
                <div className="min-w-0 flex-[0_0_100%] px-1 lg:flex-[0_0_88%]" key={promotion.id}>
                  <motion.article
                    animate={{
                      scale: selected === index ? 1 : 0.94,
                      opacity: selected === index ? 1 : 0.55,
                    }}
                    transition={{ type: 'spring', stiffness: 180, damping: 26 }}
                    className="overflow-hidden rounded-3xl bg-cream-50 shadow-plate"
                  >
                    <img
                      src={promotion.imageUrl}
                      alt={promotion.title + ': ' + promotion.subtitle}
                      className="aspect-[1440/600] w-full object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </motion.article>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Destaque anterior"
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-cream-50/90 p-3 text-ink-800 shadow-warm transition hover:bg-chianti-600 hover:text-cream-50 lg:block"
          >
            <ChevronLeft size={22} aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Próximo destaque"
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-cream-50/90 p-3 text-ink-800 shadow-warm transition hover:bg-chianti-600 hover:text-cream-50 lg:block"
          >
            <ChevronRight size={22} aria-hidden />
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3" role="tablist" aria-label="Dias da semana">
          {promotions.map((promotion, index) => (
            <button
              key={promotion.id}
              type="button"
              role="tab"
              aria-selected={selected === index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={
                'rounded-full px-4 py-2 text-[0.68rem] uppercase tracking-[0.2em] transition-colors ' +
                (selected === index
                  ? 'bg-chianti-600 text-cream-50'
                  : 'bg-cream-300/60 text-ink-700 hover:bg-cream-300')
              }
            >
              {WEEKDAY_LABELS[promotion.weekday]}
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <ButtonLink to="/cardapio" variant="secondary">
            Ver o cardápio completo
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
