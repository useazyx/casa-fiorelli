import type { FastifyInstance } from 'fastify'
import {
  AddCartItemController,
  ClearCartController,
  GetCartController,
  RemoveCartItemController,
  UpdateCartItemController,
} from '../controllers/cart-controller.js'

export async function cartRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate)

  app.get('/', (request, reply) => new GetCartController().handle(request, reply))
  app.post('/items', (request, reply) => new AddCartItemController().handle(request, reply))
  app.patch('/items/:itemId', (request, reply) => new UpdateCartItemController().handle(request, reply))
  app.delete('/items/:itemId', (request, reply) => new RemoveCartItemController().handle(request, reply))
  app.delete('/', (request, reply) => new ClearCartController().handle(request, reply))
}
