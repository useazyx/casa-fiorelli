import { motion } from 'framer-motion'
import { ButtonLink } from '../components/ui/Button'

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 py-32 text-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-8xl text-chianti-600"
      >
        404
      </motion.p>

      <h1 className="mt-6 font-display text-4xl">Esse prato saiu do cardápio</h1>

      <p className="mt-4 text-ink-700">
        A página que você procurou não existe, mas a cozinha continua aberta.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <ButtonLink to="/" size="lg">
          Voltar para casa
        </ButtonLink>
        <ButtonLink to="/cardapio" size="lg" variant="secondary">
          Ver o cardápio
        </ButtonLink>
      </div>
    </section>
  )
}
