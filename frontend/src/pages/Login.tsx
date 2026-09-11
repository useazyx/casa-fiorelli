import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'

export default function Login() {
  const { login } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/perfil'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      notify('Que bom ter você de volta!')
      navigate(from, { replace: true })
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não conseguimos entrar agora.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Bentornato"
      subtitle="Entre para acompanhar pedidos, reservas e cupons da casa."
      image="/img/story/vinho.webp"
    >
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="mt-5"
          required
        />

        {error && (
          <p className="mt-5 rounded-lg bg-chianti-600/10 px-4 py-3 text-sm text-chianti-600" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" loading={loading} className="mt-8 w-full">
          Entrar
        </Button>
      </form>

      <div className="mt-8 space-y-3 text-center text-sm text-ink-700">
        <p>
          <Link to="/redefinir-senha" className="link-underline text-chianti-600">
            Esqueceu sua senha?
          </Link>
        </p>
        <p>
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="link-underline text-chianti-600">
            Cadastre-se
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
