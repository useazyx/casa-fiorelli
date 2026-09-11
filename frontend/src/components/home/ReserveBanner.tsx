import { motion } from 'framer-motion'
import { Clock, MapPin, Phone } from 'lucide-react'
import { HOUSE } from '../layout/Footer'
import { ButtonLink } from '../ui/Button'

const DETAILS = [
  { icon: MapPin, label: HOUSE.address },
  { icon: Clock, label: HOUSE.hours },
  { icon: Phone, label: HOUSE.phone },
]

export function ReserveBanner() {
  return (
    <section className="relative overflow-hidden py-28" aria-labelledby="reserve-title">
      <img
        src="/img/story/ingredientes.webp"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-cream-200/88" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <p className="eyebrow mb-4">A tavola!</p>

        <h2 id="reserve-title" className="text-balance font-display text-4xl sm:text-5xl">
          A mesa já está posta. Falta você.
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-ink-700">
          Reserve o seu lugar e deixe o resto com a gente. Grupos, jantares de família ou uma mesa para dois:
          sempre cabe mais um na Casa Fiorelli.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/reservas" size="lg">
            Reservar minha mesa
          </ButtonLink>
          <ButtonLink to={HOUSE.phoneHref} size="lg" variant="secondary">
            Ligar para a casa
          </ButtonLink>
        </div>

        <ul className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm text-ink-700">
          {DETAILS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon size={16} className="text-chianti-600" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
