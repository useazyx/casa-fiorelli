import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import {
  AddCartItemService,
  ClearCartService,
  GetCartService,
  RemoveCartItemService,
  UpdateCartItemService,
} from '../services/cart-service.js'

const addItemSchema = z.object({
  menuItemId: z.string().uuid('Item inválido.'),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  notes: z.string().max(240).optional(),
})

const updateItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(20),
  notes: z.string().max(240).optional(),
})

const itemParamsSchema = z.object({ itemId: z.string().uuid() })

export class GetCartController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ cart: await new GetCartService().execute(request.user.sub) })
    } catch (error) {
      return handleError(error, reply, 'get-cart')
    }
  }
}

export class AddCartItemController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = addItemSchema.parse(request.body)

      const cart = await new AddCartItemService().execute({ userId: request.user.sub, ...data })

      return reply.status(201).send({ cart })
    } catch (error) {
      return handleError(error, reply, 'add-cart-item')
    }
  }
}

export class UpdateCartItemController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { itemId } = itemParamsSchema.parse(request.params)
      const data = updateItemSchema.parse(request.body)

      const cart = await new UpdateCartItemService().execute({ userId: request.user.sub, itemId, ...data })

      return reply.status(200).send({ cart })
    } catch (error) {
      return handleError(error, reply, 'update-cart-item')
    }
  }
}

export class RemoveCartItemController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { itemId } = itemParamsSchema.parse(request.params)

      const cart = await new RemoveCartItemService().execute(request.user.sub, itemId)

      return reply.status(200).send({ cart })
    } catch (error) {
      return handleError(error, reply, 'remove-cart-item')
    }
  }
}

export class ClearCartController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ cart: await new ClearCartService().execute(request.user.sub) })
    } catch (error) {
      return handleError(error, reply, 'clear-cart')
    }
  }
}
