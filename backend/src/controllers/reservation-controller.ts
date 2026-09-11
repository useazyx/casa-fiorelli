import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import {
  CreateReservationService,
  ListAvailabilityService,
  ListUserReservationsService,
  MAX_PEOPLE_PER_RESERVATION,
} from '../services/reservation-service.js'

const createReservationSchema = z.object({
  name: z.string().min(3, 'Informe seu nome.').max(120),
  email: z.string().email('E-mail inválido.').toLowerCase(),
  phone: z.string().min(10, 'Informe um telefone válido.').max(20),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato AAAA-MM-DD.'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido.'),
  people: z.coerce.number().int().min(1).max(MAX_PEOPLE_PER_RESERVATION),
  notes: z.string().max(500).optional(),
})

const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato AAAA-MM-DD.'),
})

export class CreateReservationController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createReservationSchema.parse(request.body)

      // Reservations are open to visitors; a logged in guest gets it linked to the account.
      let userId: string | undefined
      try {
        await request.jwtVerify()
        userId = request.user.sub
      } catch {
        userId = undefined
      }

      const reservation = await new CreateReservationService().execute({ ...data, userId })

      return reply.status(201).send({ reservation })
    } catch (error) {
      return handleError(error, reply, 'create-reservation')
    }
  }
}

export class GetAvailabilityController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date } = availabilityQuerySchema.parse(request.query)

      return reply.status(200).send(await new ListAvailabilityService().execute(date))
    } catch (error) {
      return handleError(error, reply, 'reservation-availability')
    }
  }
}

export class ListUserReservationsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const reservations = await new ListUserReservationsService().execute(request.user.sub)

      return reply.status(200).send({ reservations })
    } catch (error) {
      return handleError(error, reply, 'list-user-reservations')
    }
  }
}
