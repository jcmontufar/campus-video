import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { AuthMode, LoginInput, RegistroInput } from '../types'
import { getErrorMessage } from '../utils/errors'
import { validateLogin, validateRegistro } from '../utils/validation'

const EMPTY_LOGIN: LoginInput = { identificador: '', pin: '' }
const EMPTY_REGISTER: RegistroInput = { carne: '', nombre: '', correo: '', pin: '' }

export function AuthModal({ initialMode, onClose }: { initialMode: AuthMode; onClose: () => void }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [loginValues, setLoginValues] = useState(EMPTY_LOGIN)
  const [registerValues, setRegisterValues] = useState(EMPTY_REGISTER)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    document.body.classList.add('modal-open')
    dialogRef.current?.querySelector<HTMLElement>('input')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button, input, [href], [tabindex]:not([tabindex="-1"])')]
        const first = focusable[0]
        const last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [onClose])

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setErrors({})
    setMessage('')
    window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>('input')?.focus())
  }

  async function submitLogin(event: FormEvent) {
    event.preventDefault()
    const fieldErrors = validateLogin(loginValues)
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }
    setBusy(true)
    setErrors({})
    setMessage('')
    try {
      await login(loginValues)
      onClose()
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function submitRegister(event: FormEvent) {
    event.preventDefault()
    const fieldErrors = validateRegistro(registerValues)
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }
    setBusy(true)
    setErrors({})
    setMessage('')
    try {
      await register(registerValues)
      setLoginValues({ identificador: registerValues.correo, pin: '' })
      setMode('login')
      setMessage('Cuenta creada correctamente. Ya puedes iniciar sesión.')
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" ref={dialogRef}>
        <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="auth-heading">
          <span className="brand-mark">CV</span>
          <p className="eyebrow">Campus Video</p>
          <h2 id="auth-title">{mode === 'login' ? 'Qué bueno verte de nuevo' : 'Crea tu cuenta estudiantil'}</h2>
          <p>{mode === 'login' ? 'Continúa aprendiendo desde donde lo dejaste.' : 'Completa tus datos para participar en la comunidad.'}</p>
        </div>

        {message && <div className={mode === 'login' && message.startsWith('Cuenta') ? 'notice notice--success' : 'notice notice--error'} role="status">{message}</div>}

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={submitLogin} noValidate>
            <Field label="Carné o correo electrónico" id="login-id" error={errors.identificador}>
              <input id="login-id" value={loginValues.identificador} onChange={(e) => setLoginValues({ ...loginValues, identificador: e.target.value })} aria-invalid={Boolean(errors.identificador)} aria-describedby={errors.identificador ? 'login-id-error' : undefined} autoComplete="username" placeholder="9999-99-99999 o correo@umg.edu.gt" />
            </Field>
            <Field label="PIN" id="login-pin" error={errors.pin}>
              <input id="login-pin" type="password" inputMode="numeric" value={loginValues.pin} onChange={(e) => setLoginValues({ ...loginValues, pin: e.target.value })} aria-invalid={Boolean(errors.pin)} aria-describedby={errors.pin ? 'login-pin-error' : undefined} autoComplete="current-password" placeholder="Solo números" />
            </Field>
            <button className="button button--primary button--wide" disabled={busy} type="submit">{busy ? 'Iniciando…' : 'Iniciar sesión'}</button>
            <p className="form-switch">¿Aún no tienes cuenta? <button type="button" onClick={() => changeMode('registro')}>Crear cuenta</button></p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={submitRegister} noValidate>
            <Field label="Carné" id="register-carne" error={errors.carne} hint="Formato: 9999-99-99999">
              <input id="register-carne" value={registerValues.carne} onChange={(e) => setRegisterValues({ ...registerValues, carne: e.target.value })} aria-invalid={Boolean(errors.carne)} aria-describedby={errors.carne ? 'register-carne-error' : 'register-carne-hint'} autoComplete="username" placeholder="9999-99-99999" />
            </Field>
            <Field label="Nombre completo" id="register-name" error={errors.nombre}>
              <input id="register-name" value={registerValues.nombre} onChange={(e) => setRegisterValues({ ...registerValues, nombre: e.target.value })} aria-invalid={Boolean(errors.nombre)} aria-describedby={errors.nombre ? 'register-name-error' : undefined} autoComplete="name" placeholder="Tu nombre y apellidos" />
            </Field>
            <Field label="Correo electrónico" id="register-email" error={errors.correo}>
              <input id="register-email" type="email" value={registerValues.correo} onChange={(e) => setRegisterValues({ ...registerValues, correo: e.target.value })} aria-invalid={Boolean(errors.correo)} aria-describedby={errors.correo ? 'register-email-error' : undefined} autoComplete="email" placeholder="correo@ejemplo.com" />
            </Field>
            <Field label="PIN" id="register-pin" error={errors.pin} hint="Utiliza únicamente números.">
              <input id="register-pin" type="password" inputMode="numeric" value={registerValues.pin} onChange={(e) => setRegisterValues({ ...registerValues, pin: e.target.value })} aria-invalid={Boolean(errors.pin)} aria-describedby={errors.pin ? 'register-pin-error' : 'register-pin-hint'} autoComplete="new-password" placeholder="Solo números" />
            </Field>
            <button className="button button--primary button--wide" disabled={busy} type="submit">{busy ? 'Creando cuenta…' : 'Crear cuenta'}</button>
            <p className="form-switch">¿Ya tienes cuenta? <button type="button" onClick={() => changeMode('login')}>Iniciar sesión</button></p>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, id, error, hint, children }: { label: string; id: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <small className="field-error" id={`${id}-error`}>{error}</small> : hint ? <small className="field-hint" id={`${id}-hint`}>{hint}</small> : null}
    </div>
  )
}
