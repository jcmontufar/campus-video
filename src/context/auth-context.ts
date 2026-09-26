import { createContext } from 'react'
import type { LoginInput, RegistroInput, Sesion } from '../types'

export interface AuthContextValue {
  session: Sesion | null
  login: (input: LoginInput) => Promise<void>
  register: (input: RegistroInput) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
