import fastifyJwt from '@fastify/jwt'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import type { Role } from '@prisma/client'
import { env } from '../config/env.js'

/**
 * Registers JWT support plus the two guards used by the routes.
 * Wrapped in fastify-plugin so the decorators escape this plugin's scope.
 */
async function authPlugin(app: FastifyInstance) {
  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
    cookie: { cookieName: 'token', signed: false },
  })

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.status(401).send({ error: 'Sessão expirada ou inválida.', code: 'UNAUTHORIZED' })
    }
  })

  app.decorate('authorize', (roles: Role[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify()
      } catch {
        return reply.status(401).send({ error: 'Sessão expirada ou inválida.', code: 'UNAUTHORIZED' })
      }

      if (!roles.includes(request.user.role)) {
        return reply.status(403).send({ error: 'Acesso negado.', code: 'FORBIDDEN' })
      }
    }
  })
}

export default fp(authPlugin, { name: 'auth' })
