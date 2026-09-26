import type { LoginInput, RegistroInput } from '../types'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

const CARNE_PATTERN = /^\d{4}-\d{2}-\d{5}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PIN_PATTERN = /^\d+$/

export function isCarne(value: string): boolean {
  return CARNE_PATTERN.test(value)
}

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value)
}

export function validateRegistro(values: RegistroInput): FieldErrors<RegistroInput> {
  const errors: FieldErrors<RegistroInput> = {}
  if (!values.carne.trim()) errors.carne = 'El carné es obligatorio.'
  else if (!isCarne(values.carne.trim())) errors.carne = 'Usa el formato 9999-99-99999.'
  if (!values.nombre.trim()) errors.nombre = 'El nombre completo es obligatorio.'
  if (!values.correo.trim()) errors.correo = 'El correo es obligatorio.'
  else if (!isEmail(values.correo.trim())) errors.correo = 'Ingresa un correo válido.'
  if (!values.pin) errors.pin = 'El PIN es obligatorio.'
  else if (!PIN_PATTERN.test(values.pin)) errors.pin = 'El PIN debe contener únicamente números.'
  return errors
}

export function validateLogin(values: LoginInput): FieldErrors<LoginInput> {
  const errors: FieldErrors<LoginInput> = {}
  const identifier = values.identificador.trim()
  if (!identifier) errors.identificador = 'El carné o correo es obligatorio.'
  else if (!isCarne(identifier) && !isEmail(identifier)) {
    errors.identificador = 'Ingresa un carné 9999-99-99999 o un correo válido.'
  }
  if (!values.pin) errors.pin = 'El PIN es obligatorio.'
  else if (!PIN_PATTERN.test(values.pin)) errors.pin = 'El PIN debe contener únicamente números.'
  return errors
}
