import { prisma } from '../config/prisma.js'
import { BadRequestError } from '../errors/index.js'

/** Opening hours inherited from the original site footer: Seg a Sex, 10:00 - 19:00. */
export const OPENING_HOUR = 10
export const CLOSING_HOUR = 19
export const SEATS_PER_SLOT = 40
export const MAX_PEOPLE_PER_RESERVATION = 20

/** Half-hour slots, the last one starting an hour before closing. */
export function buildTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = OPENING_HOUR; hour <= CLOSING_HOUR - 1; hour++) {
    const label = String(hour).padStart(2, '0')
    slots.push(label + ':00')
    slots.push(label + ':30')
  }
  return slots
}

/** Parses YYYY-MM-DD as a calendar date, free of timezone drift. */
function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function isClosed(date: Date): boolean {
  const weekday = date.getUTCDay()
  return weekday === 0 || weekday === 6
}

const ACTIVE_STATUSES = ['REQUESTED', 'CONFIRMED', 'SEATED'] as const

interface CreateReservationInput {
  userId?: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  people: number
  notes?: string
}

export class CreateReservationService {
  async execute({ userId, name, email, phone, date, time, people, notes }: CreateReservationInput) {
    const parsed = parseDate(date)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    if (Number.isNaN(parsed.getTime())) throw new BadRequestError('Data inválida.')
    if (parsed < today) throw new BadRequestError('Escolha uma data a partir de hoje.')
    if (isClosed(parsed)) throw new BadRequestError('Abrimos de segunda a sexta. Escolha um dia útil.')
    if (!buildTimeSlots().includes(time)) {
      throw new BadRequestError('Atendemos das 10:00 às 19:00. Escolha um horário nesse intervalo.')
    }
    if (people < 1 || people > MAX_PEOPLE_PER_RESERVATION) {
      throw new BadRequestError(
        'Reservamos mesas para até ' + MAX_PEOPLE_PER_RESERVATION + ' pessoas. Para grupos maiores, fale com a casa.',
      )
    }

    const booked = await prisma.reservation.aggregate({
      where: { date: parsed, time, status: { in: [...ACTIVE_STATUSES] } },
      _sum: { people: true },
    })

    const occupied = booked._sum.people ?? 0

    if (occupied + people > SEATS_PER_SLOT) {
      throw new BadRequestError('Este horário já está lotado. Escolha outro horário para a sua mesa.')
    }

    const reservation = await prisma.reservation.create({
      data: { userId, name, email, phone, date: parsed, time, people, notes },
    })

    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          title: 'Reserva solicitada',
          body: 'Recebemos seu pedido de mesa para ' + people + ' pessoa(s) em ' + date + ' às ' + time + '. Confirmaremos em breve.',
        },
      })
    }

    return reservation
  }
}

export class ListAvailabilityService {
  /** Each slot of a day with the seats still free, so the form can grey out full hours. */
  async execute(date: string) {
    const parsed = parseDate(date)

    if (Number.isNaN(parsed.getTime())) throw new BadRequestError('Data inválida.')

    if (isClosed(parsed)) {
      return { date, closed: true, slots: [] as { time: string; seatsLeft: number }[] }
    }

    const reservations = await prisma.reservation.groupBy({
      by: ['time'],
      where: { date: parsed, status: { in: [...ACTIVE_STATUSES] } },
      _sum: { people: true },
    })

    const occupiedByTime = new Map(reservations.map((row) => [row.time, row._sum.people ?? 0]))

    return {
      date,
      closed: false,
      slots: buildTimeSlots().map((time) => ({
        time,
        seatsLeft: Math.max(0, SEATS_PER_SLOT - (occupiedByTime.get(time) ?? 0)),
      })),
    }
  }
}

export class ListUserReservationsService {
  async execute(userId: string) {
    return prisma.reservation.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    })
  }
}
