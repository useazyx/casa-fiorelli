import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import {
  GetMenuItemService,
  ListCategoriesService,
  ListMenuItemsService,
  ListPromotionsService,
} from '../services/menu-service.js'

const listItemsQuerySchema = z.object({
  category: z.string().min(1).optional(),
  search: z.string().min(1).max(80).optional(),
  featured: z.coerce.boolean().optional(),
  vegetarian: z.coerce.boolean().optional(),
  maxPrice: z.coerce.number().positive().optional(),
})

const itemParamsSchema = z.object({ slug: z.string().min(1) })

export class ListCategoriesController {
  async handle(_request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ categories: await new ListCategoriesService().execute() })
    } catch (error) {
      return handleError(error, reply, 'list-categories')
    }
  }
}

export class ListMenuItemsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = listItemsQuerySchema.parse(request.query)

      return reply.status(200).send({ items: await new ListMenuItemsService().execute(query) })
    } catch (error) {
      return handleError(error, reply, 'list-menu-items')
    }
  }
}

export class GetMenuItemController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = itemParamsSchema.parse(request.params)

      return reply.status(200).send({ item: await new GetMenuItemService().execute(slug) })
    } catch (error) {
      return handleError(error, reply, 'get-menu-item')
    }
  }
}

export class ListPromotionsController {
  async handle(_request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({ promotions: await new ListPromotionsService().execute() })
    } catch (error) {
      return handleError(error, reply, 'list-promotions')
    }
  }
}
