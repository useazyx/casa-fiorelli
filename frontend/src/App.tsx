import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { BrandLoader } from './components/ui/Loaders'
import { useAuth } from './context/AuthContext'

// Route level code splitting: a visitor landing on the home page downloads the home page.
const Home = lazy(() => import('./pages/Home'))
const Story = lazy(() => import('./pages/Story'))
const MenuPage = lazy(() => import('./pages/Menu'))
const Reservations = lazy(() => import('./pages/Reservations'))
const Contact = lazy(() => import('./pages/Contact'))
const CartPage = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <BrandLoader label="Conferindo sua reserva..." />

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  return <>{children}</>
}

export default function App() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/historia" element={<Story />} />
          <Route path="/cardapio" element={<MenuPage />} />
          <Route path="/cardapio/:categoria" element={<MenuPage />} />
          <Route path="/reservas" element={<Reservations />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/redefinir-senha" element={<ResetPassword />} />

          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
