import type { FastifyReply } from 'fastify'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Requisição inválida.') {
    super(message, 400, 'BAD_REQUEST')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Credenciais inválidas.') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Você não tem permissão para esta ação.') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} não encontrado.`, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Registro já existente.') {
    super(message, 409, 'CONFLICT')
  }
}

/**
 * Maps every failure a route can produce onto an HTTP response.
 * Zod issues come back field-by-field so the frontend can highlight inputs.
 */
export function handleError(error: unknown, reply: FastifyReply, context: string) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Dados inválidos.',
      code: 'VALIDATION_ERROR',
      issues: error.flatten().fieldErrors,
    })
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ error: error.message, code: error.code })
  }

  reply.log.error({ err: error, context }, 'unhandled error')

  return reply.status(500).send({
    error: 'Erro interno do servidor.',
    code: 'INTERNAL_SERVER_ERROR',
  })
}
