import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  title: string
  subtitle: string
  image: string
  children: ReactNode
}

/** Split screen shared by login, cadastro and redefinição de senha. */
export function AuthLayout({ title, subtitle, image, children }: AuthLayoutProps) {
  return (
    <section className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <motion.img
          src={image}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
          initial={{ scale: 1.14 }}
          animate={{ scale: 1 }}
          transition={{ duration: 7, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/45 to-ink-900/20" />

        <div className="absolute inset-x-0 bottom-0 p-12 text-cream-100">
          <p className="font-script text-5xl text-gold-400">Casa Fiorelli</p>
          <p className="mt-4 max-w-sm text-cream-200/85">
            Feito à mão, servido com o coração desde 1945, na Avenida Dom Pedro.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-32 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-10 inline-flex items-center gap-3">
            <img src="/img/brand/logo.webp" alt="" className="h-10 w-10 object-contain" />
            <span className="text-[0.68rem] uppercase tracking-[0.3em] text-ink-700">Casa Fiorelli</span>
          </Link>

          <h1 className="font-display text-4xl">{title}</h1>
          <p className="mb-10 mt-3 text-ink-700">{subtitle}</p>

          {children}
        </motion.div>
      </div>
    </section>
  )
}
