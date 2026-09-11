import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { MenuItem } from '../../types/api'
import { MenuCard } from '../menu/MenuCard'

interface FeaturedCarouselProps {
  items: MenuItem[]
  onOpen: (item: MenuItem) => void
}

/**
 * Drag-and-flick showcase of the house classics.
 * Embla gives the elastic feel; the cards are the same ones used on the menu page.
 */
export function FeaturedCarousel({ items, onOpen }: FeaturedCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    containScroll: 'trimSnaps',
  })

  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  if (items.length === 0) return null

  return (
    <section className="py-24" aria-labelledby="featured-title">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">I nostri classici</p>
            <h2 id="featured-title" className="font-display text-4xl sm:text-5xl">
              Os favoritos da casa
            </h2>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              aria-label="Pratos anteriores"
              className="rounded-full border border-ink-800/20 p-3 transition hover:border-chianti-600 hover:text-chianti-600 disabled:opacity-30"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              aria-label="Próximos pratos"
              className="rounded-full border border-ink-800/20 p-3 transition hover:border-chianti-600 hover:text-chianti-600 disabled:opacity-30"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="-ml-6 flex touch-pan-y">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="min-w-0 flex-[0_0_86%] pl-6 sm:flex-[0_0_52%] lg:flex-[0_0_34%]"
              >
                <MenuCard item={item} onOpen={onOpen} index={index} />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-ink-700/60">
          Arraste para o lado para ver mais
        </p>
      </div>
    </section>
  )
}
