import { buildApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

async function start() {
  const app = await buildApp()

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'shutting down')
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))

  try {
    await app.listen({ port: env.PORT, host: env.HOST })
    app.log.info('Casa Fiorelli API on http://localhost:' + env.PORT)
  } catch (error) {
    app.log.error(error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

void start()
