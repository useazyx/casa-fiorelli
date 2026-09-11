import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'

let app: FastifyInstance
let token: string
let lasanhaId: string
let cocaId: string

async function auth() {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: {
      name: 'Cliente Carrinho',
      email: 'carrinho.' + Date.now() + '@casafiorelli.com.br',
      password: 'trattoria1945',
    },
  })

  return response.json().token as string
}

function authed(extra: Record<string, string> = {}) {
  return { authorization: 'Bearer ' + token, ...extra }
}

beforeAll(async () => {
  app = await buildApp()
  await app.ready()

  token = await auth()

  const items = (await app.inject({ method: 'GET', url: '/menu/items?category=pratos' })).json().items
  const drinks = (await app.inject({ method: 'GET', url: '/menu/items?category=bebidas' })).json().items

  lasanhaId = items.find((item: { slug: string }) => item.slug === 'lasanha-carne-queijo').id
  cocaId = drinks.find((item: { slug: string }) => item.slug === 'coca-cola-lata').id
})

afterAll(async () => {
  await app.close()
})

describe('cart', () => {
  it('requires authentication', async () => {
    const response = await app.inject({ method: 'GET', url: '/cart' })

    expect(response.statusCode).toBe(401)
  })

  it('starts empty', async () => {
    const response = await app.inject({ method: 'GET', url: '/cart', headers: authed() })
    const { cart } = response.json()

    expect(cart.items).toHaveLength(0)
    expect(cart.subtotal).toBe(0)
    expect(cart.deliveryFee).toBe(0)
  })

  it('adds a dish and charges delivery below the free threshold', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers: authed(),
      payload: { menuItemId: lasanhaId, quantity: 1 },
    })

    const { cart } = response.json()

    expect(response.statusCode).toBe(201)
    expect(cart.subtotal).toBe(74.99)
    expect(cart.deliveryFee).toBe(8.9)
    expect(cart.total).toBe(83.89)
    expect(cart.missingForFreeDelivery).toBe(45.01)
  })

  it('merges a repeated dish into a single line', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers: authed(),
      payload: { menuItemId: lasanhaId, quantity: 1 },
    })

    const { cart } = response.json()

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].quantity).toBe(2)
    expect(cart.subtotal).toBe(149.98)
    expect(cart.deliveryFee).toBe(0)
  })

  it('updates and removes lines', async () => {
    const cartBefore = (await app.inject({ method: 'GET', url: '/cart', headers: authed() })).json().cart
    const itemId = cartBefore.items[0].id

    const updated = await app.inject({
      method: 'PATCH',
      url: '/cart/items/' + itemId,
      headers: authed(),
      payload: { quantity: 1 },
    })

    expect(updated.json().cart.items[0].quantity).toBe(1)

    await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers: authed(),
      payload: { menuItemId: cocaId, quantity: 2 },
    })

    const removed = await app.inject({
      method: 'DELETE',
      url: '/cart/items/' + itemId,
      headers: authed(),
    })

    const { cart } = removed.json()

    expect(cart.items).toHaveLength(1)
    expect(cart.subtotal).toBe(14)
  })

  it('rejects an unknown dish', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers: authed(),
      payload: { menuItemId: '00000000-0000-0000-0000-000000000000', quantity: 1 },
    })

    expect(response.statusCode).toBe(404)
  })
})

describe('orders', () => {
  it('refuses to close an order with an empty cart', async () => {
    await app.inject({ method: 'DELETE', url: '/cart', headers: authed() })

    const response = await app.inject({ method: 'POST', url: '/orders', headers: authed(), payload: {} })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toBe('Seu carrinho está vazio.')
  })

  it('closes an order, applies the welcome coupon and empties the cart', async () => {
    await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers: authed(),
      payload: { menuItemId: lasanhaId, quantity: 1 },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      headers: authed(),
      payload: { couponCode: 'BENVENUTO10', notes: 'Sem cebola, por favor.' },
    })

    const { order } = response.json()

    expect(response.statusCode).toBe(201)
    expect(order.code).toMatch(/^CF-[A-Z2-9]{6}$/)
    expect(order.subtotal).toBe(74.99)
    expect(order.deliveryFee).toBe(8.9)
    expect(order.discount).toBe(7.5)
    expect(order.total).toBe(76.39)
    expect(order.items).toHaveLength(1)

    const cart = (await app.inject({ method: 'GET', url: '/cart', headers: authed() })).json().cart
    expect(cart.items).toHaveLength(0)
  })

  it('refuses to use the same coupon twice', async () => {
    await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers: authed(),
      payload: { menuItemId: lasanhaId, quantity: 1 },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      headers: authed(),
      payload: { couponCode: 'BENVENUTO10' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toBe('Você já utilizou este cupom.')
  })

  it('refuses a coupon below its minimum subtotal', async () => {
    await app.inject({ method: 'DELETE', url: '/cart', headers: authed() })
    await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers: authed(),
      payload: { menuItemId: cocaId, quantity: 1 },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      headers: authed(),
      payload: { couponCode: 'FAMIGLIA20' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toContain('150')
  })

  it('lists and cancels an order, then refuses to cancel it twice', async () => {
    const orders = (await app.inject({ method: 'GET', url: '/orders', headers: authed() })).json().orders

    expect(orders.length).toBeGreaterThan(0)

    const cancelled = await app.inject({
      method: 'PATCH',
      url: '/orders/' + orders[0].id + '/cancel',
      headers: authed(),
    })

    expect(cancelled.statusCode).toBe(200)
    expect(cancelled.json().order.status).toBe('CANCELLED')

    const again = await app.inject({
      method: 'PATCH',
      url: '/orders/' + orders[0].id + '/cancel',
      headers: authed(),
    })

    expect(again.statusCode).toBe(400)
  })

  it('never exposes another customer order', async () => {
    const otherToken = await auth()

    const orders = (await app.inject({ method: 'GET', url: '/orders', headers: authed() })).json().orders

    const response = await app.inject({
      method: 'GET',
      url: '/orders/' + orders[0].id,
      headers: { authorization: 'Bearer ' + otherToken },
    })

    expect(response.statusCode).toBe(404)
  })
})
