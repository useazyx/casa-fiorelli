import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import {
  CancelOrderService,
  CreateOrderService,
  GetOrderService,
  ListOrdersService,
} from '../services/order-service.js'

const createOrderSchema = z.object({
  addressId: z.string().uuid().optional(),
  paymentMethodId: z.string().uuid().optional(),
  couponCode: z.string().min(3).max(30).optional(),
  notes: z.string().max(500).optional(),
})

const listOrdersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

const orderParamsSchema = z.object({ orderId: z.string().uuid() })

export class CreateOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createOrderSchema.parse(request.body ?? {})

      const order = await new CreateOrderService().execute({ userId: request.user.sub, ...data })

      return reply.status(201).send({ order })
    } catch (error) {
      return handleError(error, reply, 'create-order')
    }
  }
}

export class ListOrdersController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { limit } = listOrdersQuerySchema.parse(request.query)

      const orders = await new ListOrdersService().execute(request.user.sub, limit)

      return reply.status(200).send({ orders })
    } catch (error) {
      return handleError(error, reply, 'list-orders')
    }
  }
}

export class GetOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { orderId } = orderParamsSchema.parse(request.params)

      const order = await new GetOrderService().execute(request.user.sub, orderId)

      return reply.status(200).send({ order })
    } catch (error) {
      return handleError(error, reply, 'get-order')
    }
  }
}

export class CancelOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { orderId } = orderParamsSchema.parse(request.params)

      const order = await new CancelOrderService().execute(request.user.sub, orderId)

      return reply.status(200).send({ order })
    } catch (error) {
      return handleError(error, reply, 'cancel-order')
    }
  }
}
