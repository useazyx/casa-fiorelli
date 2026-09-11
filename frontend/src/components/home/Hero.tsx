import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useRef } from 'react'
import { ButtonLink } from '../ui/Button'

const HEADLINE = ['Feito', 'à', 'mão,', 'servido', 'com', 'o', 'coração.']

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })

  // The photograph drifts slower than the text: depth without a jump.
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '48%'])
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.68, 0.9])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      <motion.div className="absolute inset-0" style={{ y: reduceMotion ? undefined : imageY }}>
        <motion.img
          src="/img/story/ambiente-original.webp"
          alt="Salão da Casa Fiorelli com paredes de tijolo e luzes quentes"
          className="h-[118%] w-full object-cover"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: 'easeOut' }}
          fetchPriority="high"
        />
      </motion.div>

      <motion.div className="absolute inset-0 bg-ink-900" style={{ opacity: overlayOpacity }} aria-hidden />
      {/* Keeps the headline legible over the photograph and hands the page to the cream below. */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink-900/85 via-ink-900/30 to-ink-900/70"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-cream-100" aria-hidden />

      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-32 text-center"
        style={{ y: reduceMotion ? undefined : contentY }}
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mb-6 text-[0.7rem] uppercase tracking-[0.42em] text-gold-400"
        >
          Cucina Italiana · Taubaté · desde 1945
        </motion.p>

        <h1 id="hero-title" className="text-balance font-display text-5xl text-cream-50 drop-shadow-[0_4px_24px_rgba(15,10,8,0.6)] sm:text-7xl lg:text-8xl">
          {HEADLINE.map((word, index) => (
            <motion.span
              key={word + index}
              className="mr-[0.25em] inline-block"
              initial={{ opacity: 0, y: 40, rotateX: 40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.28 + index * 0.06, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.9 }}
          className="mx-auto mt-8 max-w-xl text-balance text-lg text-cream-200/90"
        >
          Massas abertas na hora, molhos que cozinham devagar e uma mesa sempre posta para quem chega. Bem-vindo
          à nossa casa.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.7 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <ButtonLink to="/cardapio" size="lg" variant="gold">
            Ver o cardápio
          </ButtonLink>
          <ButtonLink
            to="/reservas"
            size="lg"
            variant="secondary"
            className="border-cream-100/60 text-cream-50 hover:border-gold-400 hover:text-gold-400"
          >
            Reservar mesa
          </ButtonLink>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-cream-100/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ opacity: { delay: 1.6 }, y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
        aria-hidden
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  )
}
