import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from '../components/ui/Modal'
import { MenuCard } from '../components/menu/MenuCard'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { ToastProvider } from '../context/ToastContext'
import { formatPrice, toISODate } from '../lib/format'
import type { MenuItem } from '../types/api'

const dish: MenuItem = {
  id: 'a3f1c2d4-0000-4000-8000-000000000001',
  slug: 'lasanha-carne-queijo',
  name: 'Lasanha de Carne e Queijo',
  description: 'Camadas de massa com molho bolonhesa, carne moída e queijo gratinado.',
  story: 'São sete camadas, nunca seis.',
  price: 74.99,
  imageUrl: '/img/dishes/lasanha-carne-queijo.webp',
  available: true,
  featured: true,
  vegetarian: false,
  serves: 2,
  prepMinutes: 40,
  tags: ['forno'],
  category: { id: 'c1', slug: 'pratos', name: 'Pratos' },
}

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>{ui}</CartProvider>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

describe('formatters', () => {
  it('formats prices in brazilian currency', () => {
    // The space before the value is a non-breaking space in pt-BR.
    expect(formatPrice(74.99).replace(/ /g, ' ')).toBe('R$ 74,99')
  })

  it('builds an ISO date without drifting a day by timezone', () => {
    expect(toISODate(new Date(2026, 7, 19, 23, 30))).toBe('2026-08-19')
  })
})

describe('MenuCard', () => {
  it('shows the dish, its price and the add button', () => {
    renderWithProviders(<MenuCard item={dish} />)

    expect(screen.getByRole('heading', { name: dish.name })).toBeInTheDocument()
    expect(screen.getByText(/74,99/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument()
  })

  it('marks the house classics and keeps the image described', () => {
    renderWithProviders(<MenuCard item={dish} />)

    expect(screen.getByText('Da casa')).toBeInTheDocument()
    expect(screen.getByAltText(dish.name)).toBeInTheDocument()
  })

  it('opens the detail when the photo is activated', async () => {
    const onOpen = vi.fn()
    renderWithProviders(<MenuCard item={dish} onOpen={onOpen} />)

    await userEvent.click(screen.getByRole('button', { name: /ver detalhes/i }))

    expect(onOpen).toHaveBeenCalledWith(dish)
  })
})

describe('Modal', () => {
  it('exposes a dialog and closes on Escape', async () => {
    const onClose = vi.fn()

    render(
      <Modal open onClose={onClose}>
        <p>Conteúdo do prato</p>
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')

    await userEvent.keyboard('{Escape}')

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('renders nothing while closed', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <p>Invisível</p>
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
