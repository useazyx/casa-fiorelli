import { useEffect, useState } from 'react'
import { CategoryShowcase } from '../components/home/CategoryShowcase'
import { FeaturedCarousel } from '../components/home/FeaturedCarousel'
import { Hero } from '../components/home/Hero'
import { PromoCarousel } from '../components/home/PromoCarousel'
import { ReserveBanner } from '../components/home/ReserveBanner'
import { StoryTeaser } from '../components/home/StoryTeaser'
import { DishModal } from '../components/menu/DishModal'
import { api } from '../lib/api'
import type { Category, MenuItem, Promotion } from '../types/api'

export default function Home() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [featured, setFeatured] = useState<MenuItem[]>([])
  const [selected, setSelected] = useState<MenuItem | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    // One round trip per section; a failure leaves that section empty instead of
    // taking the whole page down.
    void Promise.allSettled([
      api.menu.promotions(),
      api.menu.categories(),
      api.menu.items({ category: 'pratos' }, controller.signal),
    ]).then(([promotionsResult, categoriesResult, itemsResult]) => {
      if (promotionsResult.status === 'fulfilled') setPromotions(promotionsResult.value)
      if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value)
      if (itemsResult.status === 'fulfilled') setFeatured(itemsResult.value.slice(0, 8))
    })

    return () => controller.abort()
  }, [])

  return (
    <>
      <Hero />
      <StoryTeaser />
      <PromoCarousel promotions={promotions} />
      <FeaturedCarousel items={featured} onOpen={setSelected} />
      <CategoryShowcase categories={categories} />
      <ReserveBanner />

      <DishModal item={selected} onClose={() => setSelected(null)} onSelectRelated={setSelected} />
    </>
  )
}
