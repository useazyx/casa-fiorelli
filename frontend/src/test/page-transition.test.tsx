import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Layout } from '../components/layout/Layout'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { ToastProvider } from '../context/ToastContext'

// Lenis reaches for ResizeObserver and a real scroller, neither of which jsdom has.
vi.mock('lenis', () => ({
  default: class {
    raf() {}
    scrollTo() {}
    destroy() {}
  },
}))

function PageA() {
  return (
    <section>
      <h1>Página A</h1>
      <Link to="/b">Ir para B</Link>
    </section>
  )
}

function PageB() {
  return <h1>Página B</h1>
}

/** The wrapper <Layout /> puts around the routed page. */
function pageWrapper() {
  return document.getElementById('conteudo')?.firstElementChild as HTMLElement
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  window.scrollTo = vi.fn()
})

describe('transição entre páginas', () => {
  it('monta um wrapper novo para a rota que chega, sem herdar a animação de saída', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/a']}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/a" element={<PageA />} />
                  <Route path="/b" element={<PageB />} />
                </Route>
              </Routes>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Página A' })
    const wrapperOfA = pageWrapper()
    expect(wrapperOfA).toBeTruthy()

    await user.click(screen.getByRole('link', { name: 'Ir para B' }))
    await screen.findByRole('heading', { name: 'Página B' })

    // The regression: with the page held inside an <AnimatePresence mode="wait">,
    // <Outlet /> (which is never a snapshot) rendered page B inside the wrapper
    // that was busy animating *out*. Page B faded away the moment it arrived, and
    // whenever the hand-off to the incoming wrapper was interrupted it stayed at
    // the exit values (opacity 0) for good: a page that never appears.
    expect(pageWrapper()).not.toBe(wrapperOfA)
    expect(document.getElementById('conteudo')?.children).toHaveLength(1)
  })

  it('deixa a página que chega totalmente visível', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/a']}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/a" element={<PageA />} />
                  <Route path="/b" element={<PageB />} />
                </Route>
              </Routes>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Página A' })
    await user.click(screen.getByRole('link', { name: 'Ir para B' }))
    await screen.findByRole('heading', { name: 'Página B' })

    await waitFor(
      () => {
        const opacity = pageWrapper().style.opacity
        expect(opacity === '' || Number(opacity) === 1).toBe(true)
      },
      { timeout: 4000 },
    )
  })
})
