import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import fastify, { type FastifyInstance } from 'fastify'
import { env } from './config/env.js'
import authPlugin from './plugins/auth.js'
import { registerRoutes } from './routes/index.js'

/**
 * Builds the API without listening, so tests can drive it through app.inject().
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger:
      env.NODE_ENV === 'test'
        ? false
        : {
            level: env.NODE_ENV === 'production' ? 'info' : 'debug',
            transport:
              env.NODE_ENV === 'development'
                ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
                : undefined,
          },
  })

  await app.register(fastifyHelmet, { contentSecurityPolicy: false, crossOriginResourcePolicy: false })

  await app.register(fastifyCors, {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
  })

  await app.register(fastifyCookie)

  await app.register(fastifyRateLimit, {
    max: env.NODE_ENV === 'test' ? 10_000 : 200,
    timeWindow: '1 minute',
  })

  await app.register(authPlugin)
  await app.register(registerRoutes)

  app.setNotFoundHandler((request, reply) =>
    reply.status(404).send({ error: 'Rota não encontrada: ' + request.url, code: 'NOT_FOUND' }),
  )

  return app
}
