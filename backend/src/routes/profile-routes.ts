import type { FastifyInstance } from 'fastify'
import {
  ChangePasswordController,
  CreateAddressController,
  CreatePaymentMethodController,
  DeleteAddressController,
  DeletePaymentMethodController,
  GetProfileController,
  ListAddressesController,
  ListNotificationsController,
  ListPaymentMethodsController,
  ListUserCouponsController,
  MarkAllNotificationsReadController,
  MarkNotificationReadController,
  UpdateAddressController,
  UpdateProfileController,
} from '../controllers/profile-controller.js'

/** Everything the "Perfil" page of the original site needed, behind one guard. */
export async function profileRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate)

  app.get('/', (request, reply) => new GetProfileController().handle(request, reply))
  app.patch('/', (request, reply) => new UpdateProfileController().handle(request, reply))
  app.patch('/password', (request, reply) => new ChangePasswordController().handle(request, reply))

  app.get('/addresses', (request, reply) => new ListAddressesController().handle(request, reply))
  app.post('/addresses', (request, reply) => new CreateAddressController().handle(request, reply))
  app.patch('/addresses/:id', (request, reply) => new UpdateAddressController().handle(request, reply))
  app.delete('/addresses/:id', (request, reply) => new DeleteAddressController().handle(request, reply))

  app.get('/payment-methods', (request, reply) => new ListPaymentMethodsController().handle(request, reply))
  app.post('/payment-methods', (request, reply) => new CreatePaymentMethodController().handle(request, reply))
  app.delete('/payment-methods/:id', (request, reply) =>
    new DeletePaymentMethodController().handle(request, reply),
  )

  app.get('/notifications', (request, reply) => new ListNotificationsController().handle(request, reply))
  app.patch('/notifications/read-all', (request, reply) =>
    new MarkAllNotificationsReadController().handle(request, reply),
  )
  app.patch('/notifications/:id/read', (request, reply) =>
    new MarkNotificationReadController().handle(request, reply),
  )

  app.get('/coupons', (request, reply) => new ListUserCouponsController().handle(request, reply))
}
