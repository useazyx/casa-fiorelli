import { useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const CONTROL =
  'w-full rounded-lg border border-ink-800/15 bg-cream-50 px-4 py-3 text-ink-800 placeholder:text-ink-700/40 transition-colors duration-300 focus:border-chianti-500 focus:outline-none disabled:opacity-60'

const LABEL = 'mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.22em] text-ink-700'

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null

  return (
    <p id={id} className="mt-2 text-sm text-chianti-600">
      {message}
    </p>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  const id = useId()
  const errorId = id + '-error'

  return (
    <div className={className}>
      <label className={LABEL} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={CONTROL + (error ? ' border-chianti-500' : '')}
        {...props}
      />
      {hint && !error && <p className="mt-2 text-xs text-ink-700/70">{hint}</p>}
      <ErrorText id={errorId} message={error} />
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  const id = useId()
  const errorId = id + '-error'

  return (
    <div className={className}>
      <label className={LABEL} htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={CONTROL + ' min-h-32 resize-y' + (error ? ' border-chianti-500' : '')}
        {...props}
      />
      <ErrorText id={errorId} message={error} />
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  const id = useId()
  const errorId = id + '-error'

  return (
    <div className={className}>
      <label className={LABEL} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={CONTROL + ' appearance-none' + (error ? ' border-chianti-500' : '')}
        {...props}
      >
        {children}
      </select>
      <ErrorText id={errorId} message={error} />
    </div>
  )
}
