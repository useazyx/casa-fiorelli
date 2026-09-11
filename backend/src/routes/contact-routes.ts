import type { FastifyInstance } from 'fastify'
import { CreateContactMessageController } from '../controllers/contact-controller.js'

export async function contactRoutes(app: FastifyInstance) {
  app.post('/', (request, reply) => new CreateContactMessageController().handle(request, reply))
}
