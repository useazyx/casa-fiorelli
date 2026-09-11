const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const longDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const shortDateTime = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatPrice = (value: number) => currency.format(value)
export const formatDate = (value: string | Date) => longDate.format(new Date(value))
export const formatDateTime = (value: string | Date) => shortDateTime.format(new Date(value))

/** YYYY-MM-DD in local time, the format the reservation API expects. */
export function toISODate(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: 'Segunda',
  TUESDAY: 'Terça',
  WEDNESDAY: 'Quarta',
  THURSDAY: 'Quinta',
  FRIDAY: 'Sexta',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Aguardando confirmação',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Na cozinha',
  DELIVERING: 'Saiu para entrega',
  COMPLETED: 'Entregue',
  CANCELLED: 'Cancelado',
}
