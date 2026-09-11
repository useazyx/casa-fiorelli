import type { FastifyInstance } from 'fastify'
import {
  ForgotPasswordController,
  LoginController,
  LogoutController,
  MeController,
  RegisterController,
  ResetPasswordController,
} from '../controllers/auth-controller.js'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', (request, reply) => new RegisterController().handle(request, reply))
  app.post('/login', (request, reply) => new LoginController().handle(request, reply))
  app.post('/logout', (request, reply) => new LogoutController().handle(request, reply))
  app.post('/forgot-password', (request, reply) => new ForgotPasswordController().handle(request, reply))
  app.post('/reset-password', (request, reply) => new ResetPasswordController().handle(request, reply))

  app.get('/me', { onRequest: [app.authenticate] }, (request, reply) =>
    new MeController().handle(request, reply),
  )
}
