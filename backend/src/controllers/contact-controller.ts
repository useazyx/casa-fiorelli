import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleError } from '../errors/index.js'
import { CreateContactMessageService } from '../services/contact-service.js'

const contactSchema = z.object({
  name: z.string().min(3, 'Informe seu nome.').max(120),
  email: z.string().email('E-mail inválido.').toLowerCase(),
  subject: z.string().max(140).optional(),
  message: z.string().min(10, 'Escreva um pouco mais para conseguirmos ajudar.').max(2000),
})

export class CreateContactMessageController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = contactSchema.parse(request.body)

      const message = await new CreateContactMessageService().execute(data)

      return reply.status(201).send({ message })
    } catch (error) {
      return handleError(error, reply, 'create-contact-message')
    }
  }
}
