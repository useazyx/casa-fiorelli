import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, Clock, Users } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { HOUSE } from '../components/layout/Footer'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError, api } from '../lib/api'
import { toISODate } from '../lib/format'
import type { Availability } from '../types/api'

function tomorrow(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return toISODate(date)
}

export default function Reservations() {
  const { user } = useAuth()
  const { notify } = useToast()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: tomorrow(),
    time: '',
    people: 2,
    notes: '',
  })

  const [availability, setAvailability] = useState<Availability | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<{ date: string; time: string; people: number } | null>(null)

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        name: current.name || user.name,
        email: current.email || user.email,
        phone: current.phone || (user.phone ?? ''),
      }))
    }
  }, [user])

  useEffect(() => {
    if (!form.date) return

    let active = true

    api.reservations
      .availability(form.date)
      .then((value) => {
        if (!active) return
        setAvailability(value)
        // Drop a selected time that the new date no longer offers.
        setForm((current) =>
          value.slots.some((slot) => slot.time === current.time) ? current : { ...current, time: '' },
        )
      })
      .catch(() => setAvailability(null))

    return () => {
      active = false
    }
  }, [form.date])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors({})

    if (!form.time) {
      setErrors({ time: 'Escolha um horário disponível.' })
      return
    }

    setSubmitting(true)

    try {
      await api.reservations.create({
        name: form.name,
        email: form.email,
        phone: form.phone.replace(/\D/g, ''),
        date: form.date,
        time: form.time,
        people: Number(form.people),
        notes: form.notes || undefined,
      })

      setConfirmed({ date: form.date, time: form.time, people: Number(form.people) })
      notify('Reserva solicitada! Confirmaremos em breve.')
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.issues) {
          setErrors(
            Object.fromEntries(Object.entries(error.issues).map(([field, messages]) => [field, messages[0]])),
          )
        } else {
          setErrors({ form: error.message })
        }
        notify(error.message, 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-32 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="mb-8 rounded-full bg-olive-600/15 p-6 text-olive-600"
        >
          <CheckCircle2 size={54} aria-hidden />
        </motion.div>

        <h1 className="font-display text-4xl sm:text-5xl">A sua mesa está anotada</h1>

        <p className="mt-5 text-ink-700">
          Recebemos o pedido para <strong>{confirmed.people}</strong> pessoa(s) em{' '}
          <strong>{new Date(confirmed.date + 'T12:00:00').toLocaleDateString('pt-BR')}</strong> às{' '}
          <strong>{confirmed.time}</strong>. Enviaremos a confirmação por e-mail.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button onClick={() => setConfirmed(null)} variant="secondary">
            Fazer outra reserva
          </Button>
        </div>
      </section>
    )
  }

  return (
    <>
      <header className="bg-ink-900 pb-16 pt-40 text-cream-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="mb-4 text-[0.7rem] uppercase tracking-[0.34em] text-gold-400">Prenotazione</p>
          <h1 className="font-display text-5xl text-cream-50 sm:text-6xl">Reserve a sua mesa</h1>
          <p className="mt-5 max-w-2xl text-cream-200/85">
            Atendemos {HOUSE.hours.toLowerCase()}. Escolha o dia e o horário: seguramos a mesa para você.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.3fr_1fr] lg:px-10">
        <form onSubmit={handleSubmit} className="rounded-2xl bg-cream-50 p-8 shadow-warm lg:p-10" noValidate>
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Nome"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              error={errors.name}
              required
              autoComplete="name"
            />
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              label="Telefone"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              error={errors.phone}
              placeholder="(12) 99999-9999"
              required
              autoComplete="tel"
            />
            <Input
              label="Pessoas"
              type="number"
              min={1}
              max={20}
              value={form.people}
              onChange={(event) => setForm({ ...form, people: Number(event.target.value) })}
              error={errors.people}
              required
            />
            <Input
              label="Data"
              type="date"
              min={toISODate(new Date())}
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              error={errors.date}
              className="sm:col-span-2"
              required
            />
          </div>

          <fieldset className="mt-8">
            <legend className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-ink-700">
              Horário
            </legend>

            {availability?.closed ? (
              <p className="rounded-lg bg-cream-200 px-4 py-3 text-sm text-ink-700">
                A casa não abre nesse dia. Atendemos de segunda a sexta, das 10:00 às 19:00.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(availability?.slots ?? []).map((slot) => {
                  const full = slot.seatsLeft <= 0
                  const active = form.time === slot.time

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={full}
                      onClick={() => setForm({ ...form, time: slot.time })}
                      aria-pressed={active}
                      title={full ? 'Horário lotado' : slot.seatsLeft + ' lugares livres'}
                      className={
                        'rounded-full border px-4 py-2 text-sm transition ' +
                        (active
                          ? 'border-chianti-600 bg-chianti-600 text-cream-50'
                          : full
                            ? 'cursor-not-allowed border-ink-800/10 text-ink-700/35 line-through'
                            : 'border-ink-800/20 text-ink-700 hover:border-chianti-500 hover:text-chianti-600')
                      }
                    >
                      {slot.time}
                    </button>
                  )
                })}
              </div>
            )}

            {errors.time && <p className="mt-3 text-sm text-chianti-600">{errors.time}</p>}
          </fieldset>

          <Textarea
            label="Alguma observação?"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Aniversário, cadeirinha para criança, mesa perto da janela..."
            className="mt-8"
          />

          {errors.form && <p className="mt-6 text-sm text-chianti-600">{errors.form}</p>}

          <Button type="submit" size="lg" loading={submitting} className="mt-8 w-full sm:w-auto">
            Solicitar reserva
          </Button>
        </form>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-ink-900 p-8 text-cream-100">
            <p className="font-script text-4xl text-gold-400">A tavola</p>
            <ul className="mt-6 space-y-4 text-sm text-cream-200/85">
              <li className="flex items-start gap-3">
                <CalendarDays size={18} className="mt-0.5 text-terracotta-400" aria-hidden />
                {HOUSE.hours}
              </li>
              <li className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 text-terracotta-400" aria-hidden />
                Mesas por 1h30. Chegue com até 15 minutos de tolerância.
              </li>
              <li className="flex items-start gap-3">
                <Users size={18} className="mt-0.5 text-terracotta-400" aria-hidden />
                Grupos acima de 20 pessoas: fale direto com a casa pelo telefone {HOUSE.phone}.
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-warm">
            <img
              src="/img/story/ambiente-original.webp"
              alt="Salão da Casa Fiorelli preparado para o jantar"
              className="h-72 w-full object-cover"
              loading="lazy"
            />
          </div>
        </aside>
      </section>
    </>
  )
}
