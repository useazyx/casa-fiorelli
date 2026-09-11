import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'

let app: FastifyInstance

beforeAll(async () => {
  app = await buildApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

describe('menu', () => {
  it('answers the health check', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json().status).toBe('ok')
  })

  it('lists the three categories of the house', async () => {
    const response = await app.inject({ method: 'GET', url: '/menu/categories' })
    const { categories } = response.json()

    expect(response.statusCode).toBe(200)
    expect(categories.map((category: { slug: string }) => category.slug)).toEqual([
      'pratos',
      'combos',
      'bebidas',
    ])
    expect(categories[0].itemCount).toBe(10)
  })

  it('lists every available item with numeric prices', async () => {
    const response = await app.inject({ method: 'GET', url: '/menu/items' })
    const { items } = response.json()

    expect(items).toHaveLength(33)
    expect(typeof items[0].price).toBe('number')
  })

  it('filters by category', async () => {
    const response = await app.inject({ method: 'GET', url: '/menu/items?category=bebidas' })
    const { items } = response.json()

    expect(items).toHaveLength(14)
    expect(items.every((item: { category: { slug: string } }) => item.category.slug === 'bebidas')).toBe(true)
  })

  it('searches by name and by tag', async () => {
    const byName = await app.inject({ method: 'GET', url: '/menu/items?search=lasanha' })
    const byTag = await app.inject({ method: 'GET', url: '/menu/items?search=pesto' })

    expect(byName.json().items[0].slug).toBe('lasanha-carne-queijo')
    expect(byTag.json().items.length).toBeGreaterThan(0)
  })

  it('returns a dish with its story and related suggestions', async () => {
    const response = await app.inject({ method: 'GET', url: '/menu/items/risoto-camarao-ervilhas' })
    const { item } = response.json()

    expect(response.statusCode).toBe(200)
    expect(item.name).toBe('Risoto de Camarão com Ervilhas')
    expect(item.price).toBe(64.99)
    expect(item.story).toBeTruthy()
    expect(item.related).toHaveLength(3)
  })

  it('404s on an unknown dish', async () => {
    const response = await app.inject({ method: 'GET', url: '/menu/items/pizza-havaiana' })

    expect(response.statusCode).toBe(404)
    expect(response.json().code).toBe('NOT_FOUND')
  })

  it('lists the weekday specials from tuesday to sunday', async () => {
    const response = await app.inject({ method: 'GET', url: '/menu/promotions' })
    const { promotions } = response.json()

    expect(promotions).toHaveLength(6)
    expect(promotions[0].weekday).toBe('TUESDAY')
    expect(promotions[0].subtitle).toBe('Espaguete à Bolonhesa')
  })
})
