import { motion } from 'framer-motion'
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import { InstagramIcon, XIcon } from '../components/ui/SocialIcons'
import { useState, type FormEvent } from 'react'
import { HOUSE } from '../components/layout/Footer'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError, api } from '../lib/api'

const CHANNELS = [
  { icon: Phone, label: HOUSE.phone, href: HOUSE.phoneHref },
  { icon: Mail, label: HOUSE.email, href: 'mailto:' + HOUSE.email },
  { icon: MapPin, label: HOUSE.address, href: 'https://maps.google.com/?q=Avenida+Dom+Pedro+202+Taubate' },
  { icon: Clock, label: HOUSE.hours },
]

export default function Contact() {
  const { user } = useAuth()
  const { notify } = useToast()

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    subject: '',
    message: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors({})
    setSending(true)

    try {
      await api.contact.send({
        name: form.name,
        email: form.email,
        subject: form.subject || undefined,
        message: form.message,
      })

      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
      notify('Mensagem enviada! Respondemos em até um dia útil.')
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.issues) {
          setErrors(
            Object.fromEntries(Object.entries(error.issues).map(([field, messages]) => [field, messages[0]])),
          )
        }
        notify(error.message, 'error')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <header className="bg-ink-900 pb-16 pt-40 text-cream-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="mb-4 text-[0.7rem] uppercase tracking-[0.34em] text-gold-400">Parliamo</p>
          <h1 className="font-display text-5xl text-cream-50 sm:text-6xl">Fale com a gente</h1>
          <p className="mt-5 max-w-2xl text-cream-200/85">
            Dúvidas sobre o cardápio, eventos, pedidos grandes ou só um elogio para a cozinha: a casa lê tudo.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.2fr_1fr] lg:px-10">
        <form onSubmit={handleSubmit} className="rounded-2xl bg-cream-50 p-8 shadow-warm lg:p-10" noValidate>
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Seu nome"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              error={errors.name}
              required
              autoComplete="name"
            />
            <Input
              label="Seu e-mail"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              error={errors.email}
              required
              autoComplete="email"
            />
          </div>

          <Input
            label="Assunto"
            value={form.subject}
            onChange={(event) => setForm({ ...form, subject: event.target.value })}
            error={errors.subject}
            placeholder="Opcional"
            className="mt-6"
          />

          <Textarea
            label="Sua mensagem"
            value={form.message}
            onChange={(event) => setForm({ ...form, message: event.target.value })}
            error={errors.message}
            required
            className="mt-6"
          />

          <Button type="submit" size="lg" loading={sending} className="mt-8">
            <Send size={16} aria-hidden />
            Enviar mensagem
          </Button>

          {sent && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-sm text-olive-600"
              role="status"
            >
              Recebemos a sua mensagem. Obrigado por escrever para a Casa Fiorelli.
            </motion.p>
          )}
        </form>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-ink-800/10 bg-cream-50 p-8">
            <p className="eyebrow mb-6">Outros meios de contato</p>

            <ul className="space-y-5 text-sm">
              {CHANNELS.map(({ icon: Icon, label, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <Icon size={18} className="mt-0.5 shrink-0 text-chianti-600" aria-hidden />
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="link-underline text-ink-700 hover:text-chianti-600"
                    >
                      {label}
                    </a>
                  ) : (
                    <span className="text-ink-700">{label}</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex gap-3">
              <a
                href={HOUSE.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram da Casa Fiorelli"
                className="rounded-full border border-ink-800/15 p-3 transition hover:border-chianti-600 hover:text-chianti-600"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={HOUSE.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="Perfil da Casa Fiorelli no X"
                className="rounded-full border border-ink-800/15 p-3 transition hover:border-chianti-600 hover:text-chianti-600"
              >
                <XIcon size={18} />
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-warm">
            <img
              src="/img/dishes/conchiglione-ricota-espinafre.webp"
              alt="Conchiglione recheado servido na Casa Fiorelli"
              className="h-64 w-full object-cover"
              loading="lazy"
            />
          </div>
        </aside>
      </section>
    </>
  )
}
