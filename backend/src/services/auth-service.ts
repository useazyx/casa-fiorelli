import { randomBytes } from 'node:crypto'
import { prisma } from '../config/prisma.js'
import { ConflictError, NotFoundError, UnauthorizedError, BadRequestError } from '../errors/index.js'
import { hashPassword, verifyPassword } from '../utils/password.js'

interface RegisterInput {
  name: string
  email: string
  phone?: string
  password: string
}

export class RegisterUserService {
  async execute({ name, email, phone, password }: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      throw new ConflictError('Já existe uma conta com este e-mail.')
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        // A cart is created upfront so every authenticated request can assume one exists.
        cart: { create: {} },
        notifications: {
          create: {
            title: 'Benvenuto alla Casa Fiorelli!',
            body: 'Sua conta foi criada. Que tal começar pelo nosso cardápio da casa?',
          },
        },
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    })

    // Welcome coupon: the digital equivalent of the house aperitivo.
    const welcome = await prisma.coupon.findUnique({ where: { code: 'BENVENUTO10' } })
    if (welcome) {
      await prisma.userCoupon.create({ data: { userId: user.id, couponId: welcome.id } })
    }

    return user
  }
}

interface AuthenticateInput {
  email: string
  password: string
}

export class AuthenticateUserService {
  async execute({ email, password }: AuthenticateInput) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedError('E-mail ou senha incorretos.')
    }

    const matches = await verifyPassword(password, user.passwordHash)

    if (!matches) {
      throw new UnauthorizedError('E-mail ou senha incorretos.')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
    }
  }
}

export class RequestPasswordResetService {
  /**
   * Always resolves, even for unknown e-mails: telling a caller whether an
   * address exists would turn this endpoint into an account enumerator.
   */
  async execute(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) return { token: null }

    const token = randomBytes(32).toString('hex')

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    })

    return { token }
  }
}

interface ResetPasswordInput {
  token: string
  password: string
}

export class ResetPasswordService {
  async execute({ token, password }: ResetPasswordInput) {
    const reset = await prisma.passwordReset.findUnique({ where: { token } })

    if (!reset) throw new NotFoundError('Token')
    if (reset.usedAt) throw new BadRequestError('Este link já foi utilizado.')
    if (reset.expiresAt < new Date()) throw new BadRequestError('Este link expirou.')

    const passwordHash = await hashPassword(password)

    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    ])

    return { success: true }
  }
}
