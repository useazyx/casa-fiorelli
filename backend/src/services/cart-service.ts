import { prisma } from '../config/prisma.js'
import { BadRequestError, NotFoundError } from '../errors/index.js'
import { round2, toMoney } from '../utils/money.js'

export const DELIVERY_FEE = 8.9
export const FREE_DELIVERY_THRESHOLD = 120

/** Loads the cart with its items, creating it on first access. */
async function loadCart(userId: string) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
        include: { menuItem: { include: { category: true } } },
      },
    },
  })

  return cart
}

type LoadedCart = Awaited<ReturnType<typeof loadCart>>

export function serializeCart(cart: LoadedCart) {
  const items = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    notes: item.notes,
    lineTotal: round2(toMoney(item.menuItem.price) * item.quantity),
    menuItem: {
      id: item.menuItem.id,
      slug: item.menuItem.slug,
      name: item.menuItem.name,
      description: item.menuItem.description,
      price: toMoney(item.menuItem.price),
      imageUrl: item.menuItem.imageUrl,
      available: item.menuItem.available,
      category: item.menuItem.category.slug,
    },
  }))

  const subtotal = round2(items.reduce((sum, item) => sum + item.lineTotal, 0))
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    deliveryFee,
    total: round2(subtotal + deliveryFee),
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    missingForFreeDelivery: subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : round2(FREE_DELIVERY_THRESHOLD - subtotal),
  }
}

export class GetCartService {
  async execute(userId: string) {
    return serializeCart(await loadCart(userId))
  }
}

interface AddCartItemInput {
  userId: string
  menuItemId: string
  quantity: number
  notes?: string
}

export class AddCartItemService {
  async execute({ userId, menuItemId, quantity, notes }: AddCartItemInput) {
    const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } })

    if (!menuItem) throw new NotFoundError('Item do cardápio')
    if (!menuItem.available) throw new BadRequestError('Este item está indisponível no momento.')

    const cart = await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} })

    // Adding the same dish twice bumps the quantity instead of duplicating the row.
    await prisma.cartItem.upsert({
      where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
      create: { cartId: cart.id, menuItemId, quantity, notes },
      update: { quantity: { increment: quantity }, ...(notes ? { notes } : {}) },
    })

    return serializeCart(await loadCart(userId))
  }
}

interface UpdateCartItemInput {
  userId: string
  itemId: string
  quantity: number
  notes?: string
}

export class UpdateCartItemService {
  async execute({ userId, itemId, quantity, notes }: UpdateCartItemInput) {
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } } })

    if (!item) throw new NotFoundError('Item do carrinho')

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } })
    } else {
      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity, notes } })
    }

    return serializeCart(await loadCart(userId))
  }
}

export class RemoveCartItemService {
  async execute(userId: string, itemId: string) {
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } } })

    if (!item) throw new NotFoundError('Item do carrinho')

    await prisma.cartItem.delete({ where: { id: item.id } })

    return serializeCart(await loadCart(userId))
  }
}

export class ClearCartService {
  async execute(userId: string) {
    const cart = await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} })

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    return serializeCart(await loadCart(userId))
  }
}
