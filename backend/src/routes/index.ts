import type { FastifyInstance } from 'fastify'
import { authRoutes } from './auth-routes.js'
import { cartRoutes } from './cart-routes.js'
import { contactRoutes } from './contact-routes.js'
import { menuRoutes } from './menu-routes.js'
import { orderRoutes } from './order-routes.js'
import { profileRoutes } from './profile-routes.js'
import { reservationRoutes } from './reservation-routes.js'

export async function registerRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ status: 'ok', service: 'casa-fiorelli-api' }))

  app.register(authRoutes, { prefix: '/auth' })
  app.register(menuRoutes, { prefix: '/menu' })
  app.register(cartRoutes, { prefix: '/cart' })
  app.register(orderRoutes, { prefix: '/orders' })
  app.register(reservationRoutes, { prefix: '/reservations' })
  app.register(contactRoutes, { prefix: '/contact' })
  app.register(profileRoutes, { prefix: '/profile' })
}
