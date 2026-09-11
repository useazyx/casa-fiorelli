import type { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { BadRequestError, NotFoundError } from '../errors/index.js'
import { round2, toMoney } from '../utils/money.js'
import { generateOrderCode } from '../utils/order-code.js'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from './cart-service.js'

type OrderRecord = Prisma.OrderGetPayload<{
  include: { items: true; address: true; paymentMethod: true; coupon: true }
}>

const ORDER_INCLUDE = { items: true, address: true, paymentMethod: true, coupon: true } as const

export function serializeOrder(order: OrderRecord) {
  return {
    id: order.id,
    code: order.code,
    status: order.status,
    subtotal: toMoney(order.subtotal),
    deliveryFee: toMoney(order.deliveryFee),
    discount: toMoney(order.discount),
    total: toMoney(order.total),
    notes: order.notes,
    createdAt: order.createdAt,
    coupon: order.coupon ? { code: order.coupon.code, description: order.coupon.description } : null,
    address: order.address
      ? {
          id: order.address.id,
          label: order.address.label,
          street: order.address.street,
          number: order.address.number,
          complement: order.address.complement,
          district: order.address.district,
          city: order.address.city,
          state: order.address.state,
          zipCode: order.address.zipCode,
        }
      : null,
    paymentMethod: order.paymentMethod
      ? {
          id: order.paymentMethod.id,
          type: order.paymentMethod.type,
          label: order.paymentMethod.label,
          last4: order.paymentMethod.last4,
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.name,
      imageUrl: item.imageUrl,
      unitPrice: toMoney(item.unitPrice),
      quantity: item.quantity,
      notes: item.notes,
      lineTotal: round2(toMoney(item.unitPrice) * item.quantity),
    })),
  }
}

interface CreateOrderInput {
  userId: string
  addressId?: string
  paymentMethodId?: string
  couponCode?: string
  notes?: string
}

export class CreateOrderService {
  async execute({ userId, addressId, paymentMethodId, couponCode, notes }: CreateOrderInput) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { menuItem: true } } },
    })

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Seu carrinho está vazio.')
    }

    const unavailable = cart.items.find((item) => !item.menuItem.available)
    if (unavailable) {
      throw new BadRequestError(unavailable.menuItem.name + ' está indisponível no momento.')
    }

    if (addressId) {
      const address = await prisma.address.findFirst({ where: { id: addressId, userId } })
      if (!address) throw new NotFoundError('Endereço')
    }

    if (paymentMethodId) {
      const payment = await prisma.paymentMethod.findFirst({ where: { id: paymentMethodId, userId } })
      if (!payment) throw new NotFoundError('Forma de pagamento')
    }

    // Prices are re-read from the menu, never trusted from the client payload.
    const subtotal = round2(
      cart.items.reduce((sum, item) => sum + toMoney(item.menuItem.price) * item.quantity, 0),
    )

    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE

    let discount = 0
    let couponId: string | undefined

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })

      if (!coupon || !coupon.active) throw new BadRequestError('Cupom inválido.')
      if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestError('Este cupom expirou.')

      const minSubtotal = toMoney(coupon.minSubtotal)
      if (subtotal < minSubtotal) {
        throw new BadRequestError(
          'Este cupom vale para pedidos a partir de R$ ' + minSubtotal.toFixed(2).replace('.', ',') + '.',
        )
      }

      const granted = await prisma.userCoupon.findUnique({
        where: { userId_couponId: { userId, couponId: coupon.id } },
      })

      if (granted?.usedAt) throw new BadRequestError('Você já utilizou este cupom.')

      discount =
        coupon.type === 'PERCENTAGE'
          ? round2((subtotal * toMoney(coupon.value)) / 100)
          : Math.min(toMoney(coupon.value), subtotal)

      couponId = coupon.id
    }

    const total = round2(subtotal + deliveryFee - discount)

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          code: generateOrderCode(),
          userId,
          addressId,
          paymentMethodId,
          couponId,
          subtotal,
          deliveryFee,
          discount,
          total,
          notes,
          items: {
            create: cart.items.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.menuItem.name,
              imageUrl: item.menuItem.imageUrl,
              unitPrice: item.menuItem.price,
              quantity: item.quantity,
              notes: item.notes,
            })),
          },
        },
        include: ORDER_INCLUDE,
      })

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      if (couponId) {
        await tx.userCoupon.updateMany({ where: { userId, couponId }, data: { usedAt: new Date() } })
      }

      await tx.notification.create({
        data: {
          userId,
          title: 'Pedido ' + created.code + ' confirmado',
          body: 'Já estamos preparando tudo na cozinha. Buon appetito!',
        },
      })

      return created
    })

    return serializeOrder(order)
  }
}

export class ListOrdersService {
  async execute(userId: string, limit = 20) {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return orders.map(serializeOrder)
  }
}

export class GetOrderService {
  async execute(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId }, include: ORDER_INCLUDE })

    if (!order) throw new NotFoundError('Pedido')

    return serializeOrder(order)
  }
}

/** Once the kitchen starts plating, the order is no longer the customer's to cancel. */
const CANCELLABLE_STATUSES: string[] = ['PENDING', 'CONFIRMED']

export class CancelOrderService {
  async execute(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } })

    if (!order) throw new NotFoundError('Pedido')

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw new BadRequestError('Este pedido já saiu da cozinha e não pode mais ser cancelado.')
    }

    const cancelled = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
      include: ORDER_INCLUDE,
    })

    return serializeOrder(cancelled)
  }
}
