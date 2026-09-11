import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import { ButtonLink } from '../components/ui/Button'

gsap.registerPlugin(ScrollTrigger)

const MILESTONES = [
  {
    year: '1945',
    title: 'A primeira panela',
    text: 'Um pequeno salão, seis mesas e uma receita de molho trazida de casa. A Casa Fiorelli abre as portas movida pela paixão pela cozinha e pela vontade de acolher.',
    image: '/img/story/massa-fresca.webp',
  },
  {
    year: '1962',
    title: 'O improviso que virou clássico',
    text: 'Numa noite de inverno, a nonna improvisa o jantar com o que restava na despensa: bacon, carne moída e cheddar. O prato entra no cardápio e nunca mais sai.',
    image: '/img/dishes/macarrao-bacon-queijo.webp',
  },
  {
    year: '1978',
    title: 'A segunda geração',
    text: 'Os filhos assumem a cozinha e trazem o risoto do Vêneto para a mesa brasileira. O arroz arbório passa a ser mexido sempre no mesmo sentido, tradição que se cumpre até hoje.',
    image: '/img/dishes/risoto-camarao-ervilhas.webp',
  },
  {
    year: '1995',
    title: 'Sete camadas, nunca seis',
    text: 'A lasanha da casa ganha sua regra definitiva: a sétima camada é a que se oferece a quem chega de surpresa. E na Casa Fiorelli sempre chega alguém.',
    image: '/img/dishes/lasanha-carne-queijo.webp',
  },
  {
    year: 'Hoje',
    title: 'A mesa sempre posta',
    text: 'Oitenta anos depois, a casa segue na Avenida Dom Pedro. Mesmas receitas, mesmo molho de quatro horas, mesma vontade de que você se sinta em casa.',
    image: '/img/story/ambiente-original.webp',
  },
]

const VALUES = [
  {
    title: 'La Famiglia',
    text: 'Receitas passadas de mão em mão, de geração em geração. Quem senta à nossa mesa entra para a família.',
  },
  {
    title: "L'Arte di Mangiare",
    text: 'Comer é um ritual: a massa aberta na hora, o molho no tempo dele, o prato que chega quente à mesa.',
  },
  {
    title: 'Sprezzatura',
    text: 'A elegância que não parece esforço. Tudo é preparado com cuidado, e nada disso precisa aparecer.',
  },
]

export default function Story() {
  const timelineRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !timelineRef.current) return

    const context = gsap.context(() => {
      // The vertical rule is drawn as the visitor scrolls through the history.
      gsap.fromTo(
        '.timeline-progress',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top center',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 60%',
            end: 'bottom 75%',
            scrub: 0.6,
          },
        },
      )

      gsap.utils.toArray<HTMLElement>('.timeline-entry').forEach((entry) => {
        gsap.from(entry, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: entry, start: 'top 82%' },
        })

        const marker = entry.querySelector('.timeline-marker')
        if (marker) {
          gsap.from(marker, {
            scale: 0,
            duration: 0.7,
            ease: 'back.out(2)',
            scrollTrigger: { trigger: entry, start: 'top 82%' },
          })
        }
      })
    }, timelineRef)

    return () => context.revert()
  }, [])

  return (
    <>
      <header className="relative flex min-h-[70vh] items-end overflow-hidden">
        <img
          src="/img/story/ambiente-original.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/80 to-ink-900/45" aria-hidden />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4 text-[0.7rem] uppercase tracking-[0.36em] text-gold-400"
          >
            La nostra storia
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl text-balance font-display text-5xl text-cream-50 drop-shadow-[0_4px_24px_rgba(15,10,8,0.65)] sm:text-7xl"
          >
            Oitenta anos ao redor da mesma mesa
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.9 }}
            className="mt-6 max-w-2xl text-lg text-cream-200/85"
          >
            Comida é um elo entre culturas, gerações e corações. Foi assim que nossos fundadores pensaram em 1945,
            e é assim que seguimos cozinhando.
          </motion.p>
        </div>
      </header>

      <section ref={timelineRef} className="relative py-24 lg:py-32" aria-labelledby="timeline-title">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <h2 id="timeline-title" className="sr-only">
            Linha do tempo da Casa Fiorelli
          </h2>

          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-px bg-ink-800/15 lg:left-1/2" aria-hidden />
            <div
              className="timeline-progress absolute left-4 top-0 h-full w-px origin-top bg-chianti-600 lg:left-1/2"
              aria-hidden
            />

            <ol className="space-y-20">
              {MILESTONES.map((milestone, index) => (
                <li
                  key={milestone.year}
                  className={
                    'timeline-entry relative grid gap-8 pl-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pl-0 ' +
                    (index % 2 === 1 ? 'lg:[&>figure]:order-2' : '')
                  }
                >
                  <span
                    className="timeline-marker absolute left-[9px] top-2 h-3.5 w-3.5 rounded-full bg-chianti-600 ring-4 ring-cream-100 lg:left-1/2 lg:-translate-x-1/2"
                    aria-hidden
                  />

                  <figure className="overflow-hidden rounded-2xl shadow-warm">
                    <img
                      src={milestone.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-[1.4s] hover:scale-105"
                    />
                  </figure>

                  <div className={index % 2 === 1 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}>
                    <p className="font-display text-5xl text-gold-500">{milestone.year}</p>
                    <h3 className="mt-3 font-display text-3xl">{milestone.title}</h3>
                    <p className="mt-4 leading-relaxed text-ink-700">{milestone.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-paper py-24" aria-labelledby="values-title">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="eyebrow mb-3">I nostri valori</p>
          <h2 id="values-title" className="mb-14 font-display text-4xl sm:text-5xl">
            O que sustenta a casa
          </h2>

          <div className="grid gap-8 lg:grid-cols-3">
            {VALUES.map((value, index) => (
              <motion.article
                key={value.title}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-ink-800/10 bg-cream-50 p-8"
              >
                <p className="font-script text-4xl text-chianti-600">{value.title}</p>
                <p className="mt-4 leading-relaxed text-ink-700">{value.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <p className="font-script text-5xl text-chianti-600">Bem-vindo ao nosso legado</p>
          <p className="mt-6 text-ink-700">
            Bem-vindo à Casa Fiorelli. Venha conhecer os pratos que contam essa história.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink to="/cardapio" size="lg">
              Ver o cardápio
            </ButtonLink>
            <ButtonLink to="/reservas" size="lg" variant="secondary">
              Reservar mesa
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
