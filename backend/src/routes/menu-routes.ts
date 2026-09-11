import type { FastifyInstance } from 'fastify'
import {
  GetMenuItemController,
  ListCategoriesController,
  ListMenuItemsController,
  ListPromotionsController,
} from '../controllers/menu-controller.js'

export async function menuRoutes(app: FastifyInstance) {
  app.get('/categories', (request, reply) => new ListCategoriesController().handle(request, reply))
  app.get('/items', (request, reply) => new ListMenuItemsController().handle(request, reply))
  app.get('/items/:slug', (request, reply) => new GetMenuItemController().handle(request, reply))
  app.get('/promotions', (request, reply) => new ListPromotionsController().handle(request, reply))
}
