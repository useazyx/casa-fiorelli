import { AnimatePresence, motion } from 'framer-motion'
import { Menu, ShoppingBag, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { ButtonLink } from '../ui/Button'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/historia', label: 'Nossa Casa' },
  { to: '/cardapio', label: 'Cardápio' },
  { to: '/contato', label: 'Contato' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { itemCount } = useCart()
  const location = useLocation()

  // Only the home page has a hero the header can float over.
  const overHero = location.pathname === '/' && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={
        'fixed inset-x-0 top-0 z-50 transition-colors duration-500 ' +
        (overHero ? 'bg-transparent' : 'bg-cream-100/92 shadow-warm backdrop-blur-md')
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-10">
        <Link to="/" className="flex items-center gap-3" aria-label="Casa Fiorelli, página inicial">
          <img
            src="/img/brand/logo.webp"
            alt=""
            width={48}
            height={48}
            className="h-11 w-11 object-contain"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span
              className={
                'font-display text-xl tracking-wide ' + (overHero ? 'text-cream-50' : 'text-ink-900')
              }
            >
              Casa Fiorelli
            </span>
            <span
              className={
                'text-[0.6rem] uppercase tracking-[0.34em] ' +
                (overHero ? 'text-cream-200/80' : 'text-ink-700/70')
              }
            >
              Cucina · 1945
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Principal">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={
                'link-underline text-[0.78rem] uppercase tracking-[0.24em] transition-colors ' +
                (overHero ? 'text-cream-100 hover:text-gold-400' : 'text-ink-800 hover:text-chianti-600')
              }
            >
              {({ isActive }) => <span data-active={isActive}>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/carrinho"
            aria-label={'Carrinho com ' + itemCount + ' item(ns)'}
            className={
              'relative rounded-full p-2.5 transition-colors ' +
              (overHero ? 'text-cream-100 hover:bg-cream-50/15' : 'text-ink-800 hover:bg-cream-300/60')
            }
          >
            <ShoppingBag size={20} aria-hidden />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-chianti-600 px-1 text-[0.65rem] font-semibold text-cream-50"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <Link
            to={user ? '/perfil' : '/login'}
            aria-label={user ? 'Meu perfil' : 'Entrar'}
            className={
              'rounded-full p-2.5 transition-colors ' +
              (overHero ? 'text-cream-100 hover:bg-cream-50/15' : 'text-ink-800 hover:bg-cream-300/60')
            }
          >
            <User size={20} aria-hidden />
          </Link>

          <div className="hidden lg:block">
            <ButtonLink to="/reservas" size="sm" variant={overHero ? 'gold' : 'primary'}>
              Reservar mesa
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            className={
              'rounded-full p-2.5 transition-colors lg:hidden ' +
              (overHero ? 'text-cream-100 hover:bg-cream-50/15' : 'text-ink-800 hover:bg-cream-300/60')
            }
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ink-800/10 bg-cream-100 lg:hidden"
            aria-label="Menu móvel"
          >
            <div className="flex flex-col gap-1 px-6 py-5">
              {LINKS.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className="block py-3 font-display text-2xl text-ink-900"
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}

              <ButtonLink to="/reservas" className="mt-4 w-full">
                Reservar mesa
              </ButtonLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
