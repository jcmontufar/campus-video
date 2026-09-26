import { useState } from 'react'
import { AuthModal } from './components/AuthModal'
import { Header } from './components/Header'
import { AuthProvider } from './context/AuthContext'
import { CatalogPage } from './pages/CatalogPage'
import type { AuthMode } from './types'
import './App.css'

function CampusVideoApp() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  return (
    <div className="app-shell">
      <Header onOpenAuth={setAuthMode} />
      <main>
        <CatalogPage onRequireAuth={() => setAuthMode('login')} />
      </main>
      <footer className="site-footer">
        <span className="brand-mark brand-mark--small" aria-hidden="true">CV</span>
        <div className="site-footer__copy">
          <p className="site-footer__credit">
            Desarrollado por: Juan Montufar · Seminario de Privados · 1390-22-12623
          </p>
          <p>Campus Video · Aprende a tu ritmo, estés donde estés.</p>
        </div>
      </footer>
      {authMode && (
        <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CampusVideoApp />
    </AuthProvider>
  )
}

export default App
