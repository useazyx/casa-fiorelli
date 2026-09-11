import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'

export default function Register() {
  const { register } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone ? form.phone.replace(/\D/g, '') : undefined,
        password: form.password,
      })

      notify('Benvenuto! Sua conta está pronta, e o cupom BENVENUTO10 também.')
      navigate('/perfil', { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError) {
        if (caught.issues) {
          setErrors(
            Object.fromEntries(Object.entries(caught.issues).map(([field, messages]) => [field, messages[0]])),
          )
        } else {
          setErrors({ form: caught.message })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Crie a sua conta"
      subtitle="Guarde seus endereços, acompanhe pedidos e receba os cupons da casa."
      image="/img/story/massa-fresca.webp"
    >
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Seu nome completo"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          error={errors.name}
          autoComplete="name"
          required
        />

        <Input
          label="Seu e-mail"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          error={errors.email}
          autoComplete="email"
          className="mt-5"
          required
        />

        <Input
          label="Telefone"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          error={errors.phone}
          placeholder="(12) 99999-9999"
          autoComplete="tel"
          className="mt-5"
        />

        <Input
          label="Senha"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          error={errors.password}
          hint="Pelo menos 8 caracteres."
          autoComplete="new-password"
          className="mt-5"
          required
        />

        {errors.form && (
          <p className="mt-5 rounded-lg bg-chianti-600/10 px-4 py-3 text-sm text-chianti-600" role="alert">
            {errors.form}
          </p>
        )}

        <Button type="submit" size="lg" loading={loading} className="mt-8 w-full">
          Cadastrar
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-700">
        Já tem conta?{' '}
        <Link to="/login" className="link-underline text-chianti-600">
          Faça login
        </Link>
      </p>
    </AuthLayout>
  )
}
