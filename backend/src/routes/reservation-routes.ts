import type { FastifyInstance } from 'fastify'
import {
  CreateReservationController,
  GetAvailabilityController,
  ListUserReservationsController,
} from '../controllers/reservation-controller.js'

export async function reservationRoutes(app: FastifyInstance) {
  app.get('/availability', (request, reply) => new GetAvailabilityController().handle(request, reply))
  app.post('/', (request, reply) => new CreateReservationController().handle(request, reply))

  app.get('/me', { onRequest: [app.authenticate] }, (request, reply) =>
    new ListUserReservationsController().handle(request, reply),
  )
}
