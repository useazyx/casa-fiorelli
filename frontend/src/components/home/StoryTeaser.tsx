import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { ButtonLink } from '../ui/Button'

const NUMBERS = [
  { value: '1945', label: 'Ano em que tudo começou' },
  { value: '80', label: 'Anos de receitas de família' },
  { value: '4h', label: 'De molho no fogo baixo' },
]

/** The "Sobre Nós" text of the original site, given room to breathe. */
export function StoryTeaser() {
  const containerRef = useRef<HTMLDivElement>(null)
  const revealRef = useReveal<HTMLDivElement>({ stagger: 120 })
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section className="overflow-hidden py-24 lg:py-32" aria-labelledby="story-title">
      <div ref={containerRef} className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] shadow-plate">
            <motion.img
              src="/img/dishes/espaguete-bolonhesa.webp"
              alt="Espaguete à bolonhesa servido na mesa da Casa Fiorelli"
              className="h-[30rem] w-full scale-110 object-cover"
              style={{ y: reduceMotion ? undefined : imageY }}
              loading="lazy"
              decoding="async"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-8 -right-2 hidden rounded-2xl bg-chianti-600 px-8 py-6 text-center text-cream-50 shadow-plate sm:block"
          >
            <p className="font-script text-4xl leading-none text-gold-400">Famiglia</p>
            <p className="mt-2 text-[0.65rem] uppercase tracking-[0.28em]">Desde 1945</p>
          </motion.div>
        </div>

        <div ref={revealRef}>
          <p className="eyebrow mb-4" data-reveal>
            La nostra storia
          </p>

          <h2 id="story-title" className="text-balance font-display text-4xl sm:text-5xl" data-reveal>
            Mais do que um restaurante, uma casa
          </h2>

          <p className="mt-6 leading-relaxed text-ink-700" data-reveal>
            Em 1945 nasceu um pequeno restaurante italiano, movido pela paixão pela cozinha e pela vontade de
            criar uma casa de acolhimento e alegria. Com raízes na tradição italiana, nos tornamos, ao longo do
            tempo, um lugar onde histórias se cruzam e momentos especiais ganham vida ao redor da mesa.
          </p>

          <p className="mt-4 leading-relaxed text-ink-700" data-reveal>
            Cada prato carrega o compromisso de honrar o legado dos nossos fundadores, que acreditavam que comida
            é um elo entre culturas, gerações e corações.
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-ink-800/10 pt-8" data-reveal>
            {NUMBERS.map((number) => (
              <div key={number.label}>
                <dt className="font-display text-3xl text-chianti-600">{number.value}</dt>
                <dd className="mt-1 text-[0.68rem] uppercase leading-relaxed tracking-[0.14em] text-ink-700/70">
                  {number.label}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10" data-reveal>
            <ButtonLink to="/historia" variant="secondary">
              Conhecer nossa história
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
