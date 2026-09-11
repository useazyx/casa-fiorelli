import type { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { NotFoundError } from '../errors/index.js'
import { toMoney } from '../utils/money.js'

type MenuItemRecord = Prisma.MenuItemGetPayload<{ include: { category: true } }>

function serializeItem(item: MenuItemRecord) {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description,
    story: item.story,
    price: toMoney(item.price),
    imageUrl: item.imageUrl,
    available: item.available,
    featured: item.featured,
    vegetarian: item.vegetarian,
    serves: item.serves,
    prepMinutes: item.prepMinutes,
    tags: item.tags,
    category: {
      id: item.category.id,
      slug: item.category.slug,
      name: item.category.name,
    },
  }
}

export type SerializedMenuItem = ReturnType<typeof serializeItem>

export class ListCategoriesService {
  async execute() {
    const categories = await prisma.category.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { items: true } } },
    })

    return categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      tagline: category.tagline,
      description: category.description,
      imageUrl: category.imageUrl,
      itemCount: category._count.items,
    }))
  }
}

interface ListMenuItemsInput {
  category?: string
  search?: string
  featured?: boolean
  vegetarian?: boolean
  maxPrice?: number
}

export class ListMenuItemsService {
  async execute({ category, search, featured, vegetarian, maxPrice }: ListMenuItemsInput) {
    const where: Prisma.MenuItemWhereInput = {
      available: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(featured === undefined ? {} : { featured }),
      ...(vegetarian === undefined ? {} : { vegetarian }),
      ...(maxPrice === undefined ? {} : { price: { lte: maxPrice } }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
              { tags: { has: search.toLowerCase() } },
            ],
          }
        : {}),
    }

    const items = await prisma.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: [{ category: { position: 'asc' } }, { position: 'asc' }],
    })

    return items.map(serializeItem)
  }
}

export class GetMenuItemService {
  async execute(slug: string) {
    const item = await prisma.menuItem.findUnique({ where: { slug }, include: { category: true } })

    if (!item) throw new NotFoundError('Prato')

    // Suggestions come from the same category so the modal always has a next bite.
    const related = await prisma.menuItem.findMany({
      where: { categoryId: item.categoryId, id: { not: item.id }, available: true },
      include: { category: true },
      orderBy: { position: 'asc' },
      take: 3,
    })

    return { ...serializeItem(item), related: related.map(serializeItem) }
  }
}

export class ListPromotionsService {
  async execute() {
    const promotions = await prisma.promotion.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
    })

    return promotions
  }
}
