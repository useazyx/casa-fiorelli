import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { useToast } from '../context/ToastContext'
import { ApiError, api } from '../lib/api'

export default function ResetPassword() {
  const { notify } = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [stage, setStage] = useState<'request' | 'reset'>('request')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function requestLink(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.auth.forgotPassword(email)

      notify(response.message, 'info')

      // Outside production the API hands back the token so the flow can be
      // completed without a mail provider wired up.
      if (response.token) setToken(response.token)

      setStage('reset')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não conseguimos enviar o link agora.')
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.auth.resetPassword({ token, password })
      notify('Senha redefinida! Entre com a nova senha.')
      navigate('/login', { replace: true })
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não conseguimos redefinir a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle={
        stage === 'request'
          ? 'Informe seu e-mail e enviaremos o link de redefinição.'
          : 'Cole o código recebido e escolha a nova senha.'
      }
      image="/img/story/ingredientes.webp"
    >
      {stage === 'request' ? (
        <form onSubmit={requestLink} noValidate>
          <Input
            label="Seu e-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          {error && (
            <p className="mt-5 text-sm text-chianti-600" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" loading={loading} className="mt-8 w-full">
            Enviar link de redefinição
          </Button>
        </form>
      ) : (
        <form onSubmit={resetPassword} noValidate>
          <Input
            label="Código de redefinição"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            hint="Em desenvolvimento, o código já vem preenchido."
            required
          />

          <Input
            label="Nova senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            className="mt-5"
            required
          />

          {error && (
            <p className="mt-5 text-sm text-chianti-600" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" loading={loading} className="mt-8 w-full">
            Salvar nova senha
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-ink-700">
        Lembrou da senha?{' '}
        <Link to="/login" className="link-underline text-chianti-600">
          Voltar ao login
        </Link>
      </p>
    </AuthLayout>
  )
}
