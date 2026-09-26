import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { AuthMode } from '../types'
import { initials } from '../utils/format'

export function Header({ onOpenAuth }: { onOpenAuth: (mode: AuthMode) => void }) {
  const { session, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Campus Video, ir al inicio">
        <span className="brand-mark" aria-hidden="true">CV</span>
        <span>Campus <strong>Video</strong></span>
      </a>
      <nav aria-label="Navegación principal">
        <a href="#catalogo">Catálogo</a>
        <a href="#categorias">Categorías</a>
      </nav>
      <div className="header-actions">
        {session ? (
          <div className="user-menu">
            <button
              className="user-button"
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="avatar">{initials(session.estudiante.nombre)}</span>
              <span className="user-copy">
                <strong>{session.estudiante.nombre}</strong>
                <small>{session.estudiante.carne}</small>
              </span>
              <span aria-hidden="true">⌄</span>
            </button>
            {menuOpen && (
              <div className="user-dropdown" role="menu">
                <button type="button" role="menuitem" onClick={logout}>Cerrar sesión</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className="button button--ghost" type="button" onClick={() => onOpenAuth('login')}>
              Iniciar sesión
            </button>
            <button className="button button--primary" type="button" onClick={() => onOpenAuth('registro')}>
              Crear cuenta
            </button>
          </>
        )}
      </div>
    </header>
  )
}
