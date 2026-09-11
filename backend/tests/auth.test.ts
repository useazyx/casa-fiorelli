import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'

let app: FastifyInstance

const newAccount = {
  name: 'Giulia Fiorelli',
  email: 'giulia.' + Date.now() + '@casafiorelli.com.br',
  password: 'trattoria1945',
}

beforeAll(async () => {
  app = await buildApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

describe('auth', () => {
  it('registers a customer, returns a token and sets the session cookie', async () => {
    const response = await app.inject({ method: 'POST', url: '/auth/register', payload: newAccount })
    const body = response.json()

    expect(response.statusCode).toBe(201)
    expect(body.user.email).toBe(newAccount.email)
    expect(body.token).toBeTruthy()
    expect(response.cookies.some((cookie) => cookie.name === 'token' && cookie.httpOnly)).toBe(true)
  })

  it('never leaks the password hash', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: newAccount.email, password: newAccount.password },
    })

    expect(response.statusCode).toBe(200)
    expect(JSON.stringify(response.json())).not.toContain('passwordHash')
  })

  it('rejects a duplicate e-mail with 409', async () => {
    const response = await app.inject({ method: 'POST', url: '/auth/register', payload: newAccount })

    expect(response.statusCode).toBe(409)
    expect(response.json().code).toBe('CONFLICT')
  })

  it('rejects a weak password with field level issues', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { name: 'Teste Curto', email: 'curto@casafiorelli.com.br', password: '123' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().issues.password).toBeTruthy()
  })

  it('rejects the wrong password without saying which field failed', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: newAccount.email, password: 'senha-errada' },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().error).toBe('E-mail ou senha incorretos.')
  })

  it('blocks /auth/me without a token', async () => {
    const response = await app.inject({ method: 'GET', url: '/auth/me' })

    expect(response.statusCode).toBe(401)
  })

  it('returns the profile with stats for an authenticated customer', async () => {
    const login = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'diana@casafiorelli.com.br', password: 'casafiorelli' },
    })

    const { token } = login.json()

    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: 'Bearer ' + token },
    })

    const { user } = response.json()

    expect(response.statusCode).toBe(200)
    expect(user.name).toBe('Diana Pacheco')
    expect(user.stats.orders).toBe(2)
    expect(user.stats.addresses).toBe(2)
  })

  it('resets a password through the token flow', async () => {
    const forgot = await app.inject({
      method: 'POST',
      url: '/auth/forgot-password',
      payload: { email: newAccount.email },
    })

    const { token } = forgot.json()
    expect(token).toBeTruthy()

    const reset = await app.inject({
      method: 'POST',
      url: '/auth/reset-password',
      payload: { token, password: 'novasenha2026' },
    })

    expect(reset.statusCode).toBe(200)

    const login = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: newAccount.email, password: 'novasenha2026' },
    })

    expect(login.statusCode).toBe(200)

    const reuse = await app.inject({
      method: 'POST',
      url: '/auth/reset-password',
      payload: { token, password: 'outrasenha2026' },
    })

    expect(reuse.statusCode).toBe(400)
  })

  it('does not reveal whether an unknown e-mail exists', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/forgot-password',
      payload: { email: 'ninguem@casafiorelli.com.br' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().token).toBeNull()
  })
})
