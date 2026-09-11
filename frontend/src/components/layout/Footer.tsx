import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { InstagramIcon, XIcon } from '../ui/SocialIcons'
import { Link } from 'react-router-dom'

/** Contact details carried over verbatim from the original site footer. */
export const HOUSE = {
  phone: '12 4002-8922',
  phoneHref: 'tel:+551240028922',
  email: 'casa.fiorelli@gmail.com',
  address: 'Avenida Dom Pedro, 202, Taubaté - SP',
  hours: 'Segunda a sexta · 10:00 às 19:00',
  instagram: 'https://instagram.com',
  twitter: 'https://x.com',
}

const SECTIONS = [
  {
    title: 'A casa',
    links: [
      { to: '/historia', label: 'Nossa história' },
      { to: '/cardapio', label: 'Cardápio' },
      { to: '/reservas', label: 'Reservas' },
      { to: '/contato', label: 'Fale com a gente' },
    ],
  },
  {
    title: 'Sua conta',
    links: [
      { to: '/perfil', label: 'Meu perfil' },
      { to: '/carrinho', label: 'Carrinho' },
      { to: '/login', label: 'Entrar' },
      { to: '/cadastro', label: 'Criar conta' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-ink-900 text-cream-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-10">
        <div>
          <img src="/img/brand/logo-extended.webp" alt="Casa Fiorelli" className="mb-6 h-16 w-auto" />
          <p className="max-w-sm text-sm leading-relaxed text-cream-300/80">
            Desde 1945 servindo massas, risotos e assados feitos à mão. Mais do que um restaurante, uma casa,
            onde o conforto de estar em família é celebrado em cada garfada.
          </p>
          <p className="mt-6 font-script text-3xl text-gold-400">Feito à mão, servido com o coração.</p>
        </div>

        {SECTIONS.map((section) => (
          <nav key={section.title} aria-label={section.title}>
            <h3 className="mb-5 text-[0.7rem] uppercase tracking-[0.3em] text-gold-400">{section.title}</h3>
            <ul className="space-y-3 text-sm">
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="link-underline text-cream-200/85 hover:text-cream-50">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className="mb-5 text-[0.7rem] uppercase tracking-[0.3em] text-gold-400">Onde nos encontrar</h3>
          <ul className="space-y-4 text-sm text-cream-200/85">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-terracotta-400" aria-hidden />
              <span>{HOUSE.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 shrink-0 text-terracotta-400" aria-hidden />
              <span>{HOUSE.hours}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-terracotta-400" aria-hidden />
              <a href={HOUSE.phoneHref} className="link-underline hover:text-cream-50">
                {HOUSE.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-terracotta-400" aria-hidden />
              <a href={'mailto:' + HOUSE.email} className="link-underline hover:text-cream-50">
                {HOUSE.email}
              </a>
            </li>
          </ul>

          <div className="mt-6 flex gap-3">
            <a
              href={HOUSE.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram da Casa Fiorelli"
              className="rounded-full border border-cream-200/25 p-2.5 transition hover:border-gold-400 hover:text-gold-400"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href={HOUSE.twitter}
              target="_blank"
              rel="noreferrer"
              aria-label="Perfil da Casa Fiorelli no X"
              className="rounded-full border border-cream-200/25 p-2.5 transition hover:border-gold-400 hover:text-gold-400"
            >
              <XIcon size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-cream-200/10 py-6 text-center text-xs text-cream-300/60">
        © {new Date().getFullYear()} Casa Fiorelli · Cucina Italiana desde 1945 · Taubaté, SP
      </div>
    </footer>
  )
}
