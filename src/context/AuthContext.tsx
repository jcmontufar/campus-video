import { useState, type ReactNode } from 'react'
import { api } from '../services/api'
import type { LoginInput, RegistroInput, Sesion } from '../types'
import { AuthContext } from './auth-context'

const STORAGE_KEY = 'campus-video-sesion'

function readSession(): Sesion | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? (JSON.parse(value) as Sesion) : null
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Sesion | null>(readSession)

  async function login(input: LoginInput) {
    const nextSession = await api.login(input)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
  }

  async function register(input: RegistroInput) {
    await api.registrar(input)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
