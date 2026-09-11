import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MenuPage from '../pages/Menu'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { ToastProvider } from '../context/ToastContext'
import type { Category, MenuItem } from '../types/api'

const categories: Category[] = [
  {
    id: 'c1',
    slug: 'pratos',
    name: 'Pratos',
    tagline: 'A cozinha da casa',
    description: 'Massas e risotos.',
    imageUrl: '/img/categories/pratos.webp',
    itemCount: 2,
  },
  {
    id: 'c2',
    slug: 'bebidas',
    name: 'Bebidas',
    tagline: 'Para acompanhar',
    description: 'Refrigerantes gelados.',
    imageUrl: '/img/categories/bebidas.webp',
    itemCount: 1,
  },
]

function makeItem(overrides: Partial<MenuItem> & { id: string; slug: string; name: string }): MenuItem {
  return {
    description: 'Descrição do prato.',
    story: null,
    price: 54.99,
    imageUrl: '/img/dishes/x.webp',
    available: true,
    featured: false,
    vegetarian: false,
    serves: 1,
    prepMinutes: 25,
    tags: [],
    category: { id: 'c1', slug: 'pratos', name: 'Pratos' },
    ...overrides,
  }
}

const items = [
  makeItem({ id: '1', slug: 'lasanha-carne-queijo', name: 'Lasanha de Carne e Queijo', price: 74.99 }),
  makeItem({
    id: '2',
    slug: 'salada-caprese-macarrao',
    name: 'Salada Caprese de Macarrão',
    vegetarian: true,
    tags: ['leve'],
  }),
]

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')

  return {
    ...actual,
    api: {
      menu: {
        categories: vi.fn(async () => categories),
        items: vi.fn(async () => items),
        item: vi.fn(async () => ({ ...items[0], related: [] })),
        promotions: vi.fn(async () => []),
      },
      auth: { me: vi.fn(async () => null) },
      cart: { get: vi.fn(async () => null) },
    },
  }
})

function renderMenu() {
  return render(
    <MemoryRouter initialEntries={['/cardapio']}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <MenuPage />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('Menu page', () => {
  it('lists every dish returned by the API', async () => {
    renderMenu()

    await waitFor(() => expect(screen.getByText('Lasanha de Carne e Queijo')).toBeInTheDocument())
    expect(screen.getByText('Salada Caprese de Macarrão')).toBeInTheDocument()
    expect(screen.getByText('2 opções')).toBeInTheDocument()
  })

  it('filters as the visitor types', async () => {
    renderMenu()

    await waitFor(() => expect(screen.getByText('Lasanha de Carne e Queijo')).toBeInTheDocument())

    await userEvent.type(screen.getByLabelText('Buscar no cardápio'), 'caprese')

    await waitFor(() => expect(screen.queryByText('Lasanha de Carne e Queijo')).not.toBeInTheDocument())
    expect(screen.getByText('Salada Caprese de Macarrão')).toBeInTheDocument()
  })

  it('shows a friendly message when nothing matches', async () => {
    renderMenu()

    await waitFor(() => expect(screen.getByText('Lasanha de Carne e Queijo')).toBeInTheDocument())

    await userEvent.type(screen.getByLabelText('Buscar no cardápio'), 'pizza havaiana')

    await waitFor(() => expect(screen.getByText(/Esse prato saiu|Nada por aqui/i)).toBeInTheDocument())
  })

  it('keeps only vegetarian dishes when the filter is pressed', async () => {
    renderMenu()

    await waitFor(() => expect(screen.getByText('Lasanha de Carne e Queijo')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /vegetariano/i }))

    await waitFor(() => expect(screen.queryByText('Lasanha de Carne e Queijo')).not.toBeInTheDocument())
    expect(screen.getByText('Salada Caprese de Macarrão')).toBeInTheDocument()
  })

  it('renders the category tabs from the API', async () => {
    renderMenu()

    await waitFor(() => expect(screen.getByRole('button', { name: 'Bebidas' })).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Tudo' })).toBeInTheDocument()
  })
})
