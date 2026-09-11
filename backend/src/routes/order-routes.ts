import type { FastifyInstance } from 'fastify'
import {
  CancelOrderController,
  CreateOrderController,
  GetOrderController,
  ListOrdersController,
} from '../controllers/order-controller.js'

export async function orderRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate)

  app.post('/', (request, reply) => new CreateOrderController().handle(request, reply))
  app.get('/', (request, reply) => new ListOrdersController().handle(request, reply))
  app.get('/:orderId', (request, reply) => new GetOrderController().handle(request, reply))
  app.patch('/:orderId/cancel', (request, reply) => new CancelOrderController().handle(request, reply))
}
