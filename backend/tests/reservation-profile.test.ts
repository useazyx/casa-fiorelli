import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'

let app: FastifyInstance
let token: string

/** Next monday, always a valid opening day. */
function nextMonday(): string {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() + ((8 - date.getUTCDay()) % 7 || 7))
  return date.toISOString().slice(0, 10)
}

/** Next saturday, always closed. */
function nextSaturday(): string {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() + ((13 - date.getUTCDay()) % 7 || 7))
  return date.toISOString().slice(0, 10)
}

beforeAll(async () => {
  app = await buildApp()
  await app.ready()

  const register = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: {
      name: 'Cliente Reserva',
      email: 'reserva.' + Date.now() + '@casafiorelli.com.br',
      password: 'trattoria1945',
    },
  })

  token = register.json().token
})

afterAll(async () => {
  await app.close()
})

function authed() {
  return { authorization: 'Bearer ' + token }
}

describe('reservations', () => {
  it('publishes 18 half-hour slots for a weekday', async () => {
    const response = await app.inject({ method: 'GET', url: '/reservations/availability?date=' + nextMonday() })
    const body = response.json()

    expect(response.statusCode).toBe(200)
    expect(body.closed).toBe(false)
    expect(body.slots).toHaveLength(18)
    expect(body.slots[0]).toEqual({ time: '10:00', seatsLeft: 40 })
  })

  it('reports the house as closed on the weekend', async () => {
    const response = await app.inject({ method: 'GET', url: '/reservations/availability?date=' + nextSaturday() })

    expect(response.json().closed).toBe(true)
    expect(response.json().slots).toHaveLength(0)
  })

  it('books a table for a visitor without an account', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/reservations',
      payload: {
        name: 'Visitante da Casa',
        email: 'visitante@example.com',
        phone: '12988887777',
        date: nextMonday(),
        time: '12:00',
        people: 4,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().reservation.status).toBe('REQUESTED')
  })

  it('links the reservation to a logged in customer', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/reservations',
      headers: authed(),
      payload: {
        name: 'Cliente Reserva',
        email: 'cliente@casafiorelli.com.br',
        phone: '12988887777',
        date: nextMonday(),
        time: '13:00',
        people: 2,
        notes: 'Mesa perto da janela.',
      },
    })

    expect(created.statusCode).toBe(201)

    const mine = await app.inject({ method: 'GET', url: '/reservations/me', headers: authed() })

    expect(mine.json().reservations).toHaveLength(1)
    expect(mine.json().reservations[0].notes).toBe('Mesa perto da janela.')
  })

  it('refuses a date in the past, a closed day and an hour outside service', async () => {
    const base = {
      name: 'Cliente Reserva',
      email: 'cliente@casafiorelli.com.br',
      phone: '12988887777',
      people: 2,
    }

    const past = await app.inject({
      method: 'POST',
      url: '/reservations',
      payload: { ...base, date: '2020-01-06', time: '12:00' },
    })

    const weekend = await app.inject({
      method: 'POST',
      url: '/reservations',
      payload: { ...base, date: nextSaturday(), time: '12:00' },
    })

    const afterHours = await app.inject({
      method: 'POST',
      url: '/reservations',
      payload: { ...base, date: nextMonday(), time: '22:00' },
    })

    expect(past.statusCode).toBe(400)
    expect(weekend.json().error).toContain('segunda a sexta')
    expect(afterHours.json().error).toContain('10:00')
  })

  it('refuses a party larger than the house takes', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/reservations',
      payload: {
        name: 'Grupo Grande',
        email: 'grupo@example.com',
        phone: '12988887777',
        date: nextMonday(),
        time: '15:00',
        people: 40,
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('fills a slot and then refuses further bookings for it', async () => {
    const date = nextMonday()

    for (let index = 0; index < 2; index++) {
      const response = await app.inject({
        method: 'POST',
        url: '/reservations',
        payload: {
          name: 'Mesa ' + index,
          email: 'mesa@example.com',
          phone: '12988887777',
          date,
          time: '18:00',
          people: 20,
        },
      })

      expect(response.statusCode).toBe(201)
    }

    const overflow = await app.inject({
      method: 'POST',
      url: '/reservations',
      payload: {
        name: 'Mesa extra',
        email: 'mesa@example.com',
        phone: '12988887777',
        date,
        time: '18:00',
        people: 2,
      },
    })

    expect(overflow.statusCode).toBe(400)
    expect(overflow.json().error).toContain('lotado')

    const availability = await app.inject({ method: 'GET', url: '/reservations/availability?date=' + date })
    const slot = availability.json().slots.find((entry: { time: string }) => entry.time === '18:00')

    expect(slot.seatsLeft).toBe(0)
  })
})

describe('contact', () => {
  it('stores a message from the contact form', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/contact',
      payload: {
        name: 'Arthur Cliente',
        email: 'arthur@example.com',
        subject: 'Evento corporativo',
        message: 'Gostaria de reservar o salão para um jantar de 30 pessoas.',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().message.id).toBeTruthy()
  })

  it('rejects a message that is too short', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/contact',
      payload: { name: 'Arthur', email: 'arthur@example.com', message: 'oi' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().issues.message).toBeTruthy()
  })
})

describe('profile', () => {
  it('creates, updates and deletes addresses keeping a default one', async () => {
    const first = await app.inject({
      method: 'POST',
      url: '/profile/addresses',
      headers: authed(),
      payload: {
        label: 'Casa',
        street: 'Avenida Dom Pedro',
        number: '202',
        district: 'Centro',
        city: 'Taubaté',
        state: 'SP',
        zipCode: '12010-000',
      },
    })

    expect(first.statusCode).toBe(201)
    expect(first.json().address.isDefault).toBe(true)

    const second = await app.inject({
      method: 'POST',
      url: '/profile/addresses',
      headers: authed(),
      payload: {
        label: 'Trabalho',
        street: 'Rua Quinze de Novembro',
        number: '90',
        district: 'Centro',
        city: 'Taubaté',
        state: 'sp',
        zipCode: '12010-100',
        isDefault: true,
      },
    })

    expect(second.json().address.state).toBe('SP')
    expect(second.json().address.isDefault).toBe(true)

    const list = await app.inject({ method: 'GET', url: '/profile/addresses', headers: authed() })
    expect(list.json().addresses[0].label).toBe('Trabalho')

    const deleted = await app.inject({
      method: 'DELETE',
      url: '/profile/addresses/' + second.json().address.id,
      headers: authed(),
    })

    expect(deleted.statusCode).toBe(204)

    const after = await app.inject({ method: 'GET', url: '/profile/addresses', headers: authed() })
    expect(after.json().addresses).toHaveLength(1)
    expect(after.json().addresses[0].isDefault).toBe(true)
  })

  it('rejects an invalid zip code', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/profile/addresses',
      headers: authed(),
      payload: {
        label: 'Erro',
        street: 'Rua Teste',
        number: '1',
        district: 'Centro',
        city: 'Taubaté',
        state: 'SP',
        zipCode: '123',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().issues.zipCode).toBeTruthy()
  })

  it('stores only the last four digits of a card', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/profile/payment-methods',
      headers: authed(),
      payload: {
        type: 'CREDIT_CARD',
        label: 'Mastercard final 5555',
        holder: 'CLIENTE RESERVA',
        last4: '5555',
        expMonth: 12,
        expYear: 2032,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(JSON.stringify(response.json())).not.toMatch(/\d{13,}/)
  })

  it('requires the card digits for a card payment method', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/profile/payment-methods',
      headers: authed(),
      payload: { type: 'DEBIT_CARD', label: 'Cartão sem número' },
    })

    expect(response.statusCode).toBe(400)
  })

  it('marks notifications as read', async () => {
    const listed = await app.inject({ method: 'GET', url: '/profile/notifications', headers: authed() })
    const notifications = listed.json().notifications

    expect(notifications.length).toBeGreaterThan(0)
    expect(notifications[0].readAt).toBeNull()

    const readAll = await app.inject({
      method: 'PATCH',
      url: '/profile/notifications/read-all',
      headers: authed(),
    })

    expect(readAll.statusCode).toBe(200)

    const profile = await app.inject({ method: 'GET', url: '/profile', headers: authed() })
    expect(profile.json().profile.stats.unreadNotifications).toBe(0)
  })

  it('lists the welcome coupon granted at registration', async () => {
    const response = await app.inject({ method: 'GET', url: '/profile/coupons', headers: authed() })
    const coupons = response.json().coupons

    expect(coupons).toHaveLength(1)
    expect(coupons[0].code).toBe('BENVENUTO10')
    expect(coupons[0].usable).toBe(true)
  })

  it('changes the password only with the current one', async () => {
    const wrong = await app.inject({
      method: 'PATCH',
      url: '/profile/password',
      headers: authed(),
      payload: { currentPassword: 'errada', newPassword: 'senhanova2026' },
    })

    expect(wrong.statusCode).toBe(401)

    const right = await app.inject({
      method: 'PATCH',
      url: '/profile/password',
      headers: authed(),
      payload: { currentPassword: 'trattoria1945', newPassword: 'senhanova2026' },
    })

    expect(right.statusCode).toBe(200)
  })
})
