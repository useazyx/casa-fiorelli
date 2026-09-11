import { prisma } from '../config/prisma.js'
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/index.js'
import { toMoney } from '../utils/money.js'
import { hashPassword, verifyPassword } from '../utils/password.js'

export class GetProfileService {
  async execute(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        balance: true,
        createdAt: true,
        _count: { select: { orders: true, addresses: true, reservations: true } },
      },
    })

    if (!user) throw new NotFoundError('Usuário')

    const unreadNotifications = await prisma.notification.count({ where: { userId, readAt: null } })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      balance: toMoney(user.balance),
      memberSince: user.createdAt,
      stats: {
        orders: user._count.orders,
        addresses: user._count.addresses,
        reservations: user._count.reservations,
        unreadNotifications,
      },
    }
  }
}

interface UpdateProfileInput {
  userId: string
  name?: string
  phone?: string | null
  avatarUrl?: string | null
}

export class UpdateProfileService {
  async execute({ userId, name, phone, avatarUrl }: UpdateProfileInput) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name === undefined ? {} : { name }),
        ...(phone === undefined ? {} : { phone }),
        ...(avatarUrl === undefined ? {} : { avatarUrl }),
      },
    })

    return new GetProfileService().execute(userId)
  }
}

interface ChangePasswordInput {
  userId: string
  currentPassword: string
  newPassword: string
}

export class ChangePasswordService {
  async execute({ userId, currentPassword, newPassword }: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) throw new NotFoundError('Usuário')

    const matches = await verifyPassword(currentPassword, user.passwordHash)

    if (!matches) throw new UnauthorizedError('Senha atual incorreta.')

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(newPassword) },
    })

    return { success: true }
  }
}

export class ListAddressesService {
  async execute(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    })
  }
}

interface AddressInput {
  label: string
  street: string
  number: string
  complement?: string | null
  district: string
  city: string
  state: string
  zipCode: string
  isDefault?: boolean
}

export class CreateAddressService {
  async execute(userId: string, input: AddressInput) {
    const count = await prisma.address.count({ where: { userId } })
    // The first address a customer saves is always the default one.
    const isDefault = input.isDefault ?? count === 0

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
    }

    return prisma.address.create({
      data: { ...input, state: input.state.toUpperCase(), isDefault, userId },
    })
  }
}

export class UpdateAddressService {
  async execute(userId: string, addressId: string, input: Partial<AddressInput>) {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } })

    if (!address) throw new NotFoundError('Endereço')

    if (input.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
    }

    return prisma.address.update({
      where: { id: address.id },
      data: { ...input, ...(input.state ? { state: input.state.toUpperCase() } : {}) },
    })
  }
}

export class DeleteAddressService {
  async execute(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } })

    if (!address) throw new NotFoundError('Endereço')

    await prisma.address.delete({ where: { id: address.id } })

    // Never leave the customer without a default address.
    if (address.isDefault) {
      const next = await prisma.address.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } })
      if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } })
    }

    return { success: true }
  }
}

export class ListPaymentMethodsService {
  async execute(userId: string) {
    return prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        type: true,
        label: true,
        holder: true,
        last4: true,
        expMonth: true,
        expYear: true,
        isDefault: true,
      },
    })
  }
}

interface PaymentMethodInput {
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH'
  label: string
  holder?: string
  /** Only the last four digits are stored. We never keep full card numbers. */
  last4?: string
  expMonth?: number
  expYear?: number
  isDefault?: boolean
}

export class CreatePaymentMethodService {
  async execute(userId: string, input: PaymentMethodInput) {
    const requiresCard = input.type === 'CREDIT_CARD' || input.type === 'DEBIT_CARD'

    if (requiresCard && !input.last4) {
      throw new BadRequestError('Informe os últimos quatro dígitos do cartão.')
    }

    const count = await prisma.paymentMethod.count({ where: { userId } })
    const isDefault = input.isDefault ?? count === 0

    if (isDefault) {
      await prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } })
    }

    return prisma.paymentMethod.create({ data: { ...input, isDefault, userId } })
  }
}

export class DeletePaymentMethodService {
  async execute(userId: string, paymentMethodId: string) {
    const method = await prisma.paymentMethod.findFirst({ where: { id: paymentMethodId, userId } })

    if (!method) throw new NotFoundError('Forma de pagamento')

    await prisma.paymentMethod.delete({ where: { id: method.id } })

    return { success: true }
  }
}

export class ListNotificationsService {
  async execute(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }
}

export class MarkNotificationReadService {
  async execute(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({ where: { id: notificationId, userId } })

    if (!notification) throw new NotFoundError('Notificação')

    return prisma.notification.update({
      where: { id: notification.id },
      data: { readAt: notification.readAt ?? new Date() },
    })
  }
}

export class MarkAllNotificationsReadService {
  async execute(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })

    return { success: true }
  }
}

export class ListUserCouponsService {
  async execute(userId: string) {
    const coupons = await prisma.userCoupon.findMany({
      where: { userId },
      include: { coupon: true },
      orderBy: { coupon: { createdAt: 'desc' } },
    })

    const now = new Date()

    return coupons.map((entry) => ({
      id: entry.id,
      code: entry.coupon.code,
      description: entry.coupon.description,
      type: entry.coupon.type,
      value: toMoney(entry.coupon.value),
      minSubtotal: toMoney(entry.coupon.minSubtotal),
      expiresAt: entry.coupon.expiresAt,
      usedAt: entry.usedAt,
      usable:
        entry.usedAt === null &&
        entry.coupon.active &&
        (entry.coupon.expiresAt === null || entry.coupon.expiresAt > now),
    }))
  }
}
