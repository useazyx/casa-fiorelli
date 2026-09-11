import { Prisma } from '@prisma/client'

/** Prisma Decimal values must never reach the client as objects. */
export function toMoney(value: Prisma.Decimal | number | string): number {
  return Number(value)
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
