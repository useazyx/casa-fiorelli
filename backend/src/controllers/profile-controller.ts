import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import {
  ChangePasswordService,
  CreateAddressService,
  CreatePaymentMethodService,
  DeleteAddressService,
  DeletePaymentMethodService,
  GetProfileService,
  ListAddressesService,
  ListNotificationsService,
  ListPaymentMethodsService,
  ListUserCouponsService,
  MarkAllNotificationsReadService,
  MarkNotificationReadService,
  UpdateAddressService,
  UpdateProfileService,
} from '../services/profile-service.js'

const updateProfileSchema = z.object({
  name: z.string().min(3).max(120).optional(),
  phone: z.string().min(10).max(20).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe sua senha atual.'),
  newPassword: z.string().min(8, 'A nova senha precisa de pelo menos 8 caracteres.').max(72),
})

const addressSchema = z.object({
  label: z.string().min(2, 'Dê um apelido para este endereço.').max(40),
  street: z.string().min(3).max(160),
  number: z.string().min(1).max(20),
  complement: z.string().max(80).nullable().optional(),
  district: z.string().min(2).max(80),
  city: z.string().min(2).max(80),
  state: z.string().length(2, 'Use a sigla do estado, como SP.'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido.'),
  isDefault: z.boolean().optional(),
})

const paymentMethodSchema = z.object({
  type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH']),
  label: z.string().min(2).max(60),
  holder: z.string().min(3).max(120).optional(),
  last4: z.string().regex(/^\d{4}$/, 'Informe os quatro últimos dígitos.').optional(),
  expMonth: z.coerce.number().int().min(1).max(12).optional(),
  expYear: z.coerce.number().int().min(new Date().getFullYear()).max(2100).optional(),
  isDefault: z.boolean().optional(),
})

const idParamsSchema = z.object({ id: z.string().uuid() })

export class GetProfileController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ profile: await new GetProfileService().execute(request.user.sub) })
    } catch (error) {
      return handleError(error, reply, 'get-profile')
    }
  }
}

export class UpdateProfileController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = updateProfileSchema.parse(request.body)

      const profile = await new UpdateProfileService().execute({ userId: request.user.sub, ...data })

      return reply.status(200).send({ profile })
    } catch (error) {
      return handleError(error, reply, 'update-profile')
    }
  }
}

export class ChangePasswordController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = changePasswordSchema.parse(request.body)

      await new ChangePasswordService().execute({ userId: request.user.sub, ...data })

      return reply.status(200).send({ success: true })
    } catch (error) {
      return handleError(error, reply, 'change-password')
    }
  }
}

export class ListAddressesController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ addresses: await new ListAddressesService().execute(request.user.sub) })
    } catch (error) {
      return handleError(error, reply, 'list-addresses')
    }
  }
}

export class CreateAddressController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = addressSchema.parse(request.body)

      const address = await new CreateAddressService().execute(request.user.sub, data)

      return reply.status(201).send({ address })
    } catch (error) {
      return handleError(error, reply, 'create-address')
    }
  }
}

export class UpdateAddressController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = idParamsSchema.parse(request.params)
      const data = addressSchema.partial().parse(request.body)

      const address = await new UpdateAddressService().execute(request.user.sub, id, data)

      return reply.status(200).send({ address })
    } catch (error) {
      return handleError(error, reply, 'update-address')
    }
  }
}

export class DeleteAddressController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = idParamsSchema.parse(request.params)

      await new DeleteAddressService().execute(request.user.sub, id)

      return reply.status(204).send()
    } catch (error) {
      return handleError(error, reply, 'delete-address')
    }
  }
}

export class ListPaymentMethodsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const paymentMethods = await new ListPaymentMethodsService().execute(request.user.sub)

      return reply.status(200).send({ paymentMethods })
    } catch (error) {
      return handleError(error, reply, 'list-payment-methods')
    }
  }
}

export class CreatePaymentMethodController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = paymentMethodSchema.parse(request.body)

      const paymentMethod = await new CreatePaymentMethodService().execute(request.user.sub, data)

      return reply.status(201).send({ paymentMethod })
    } catch (error) {
      return handleError(error, reply, 'create-payment-method')
    }
  }
}

export class DeletePaymentMethodController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = idParamsSchema.parse(request.params)

      await new DeletePaymentMethodService().execute(request.user.sub, id)

      return reply.status(204).send()
    } catch (error) {
      return handleError(error, reply, 'delete-payment-method')
    }
  }
}

export class ListNotificationsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const notifications = await new ListNotificationsService().execute(request.user.sub)

      return reply.status(200).send({ notifications })
    } catch (error) {
      return handleError(error, reply, 'list-notifications')
    }
  }
}

export class MarkNotificationReadController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = idParamsSchema.parse(request.params)

      const notification = await new MarkNotificationReadService().execute(request.user.sub, id)

      return reply.status(200).send({ notification })
    } catch (error) {
      return handleError(error, reply, 'mark-notification-read')
    }
  }
}

export class MarkAllNotificationsReadController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      await new MarkAllNotificationsReadService().execute(request.user.sub)

      return reply.status(200).send({ success: true })
    } catch (error) {
      return handleError(error, reply, 'mark-all-notifications-read')
    }
  }
}

export class ListUserCouponsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ coupons: await new ListUserCouponsService().execute(request.user.sub) })
    } catch (error) {
      return handleError(error, reply, 'list-user-coupons')
    }
  }
}
