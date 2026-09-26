import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { Categoria, Video } from '../types'
import { getErrorMessage } from '../utils/errors'
import { VideoCard } from '../components/VideoCard'
import { VideoModal } from '../components/VideoModal'

export function CatalogPage({ onRequireAuth }: { onRequireAuth: () => void }) {
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Categoria[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [selected, setSelected] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [videoData, categoryData] = await Promise.all([api.getVideos(), api.getCategorias()])
        if (active) {
          setVideos(videoData)
          setCategories(categoryData)
        }
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError))
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [reloadKey])

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es')
    return videos.filter((video) => {
      const matchesTitle = video.titulo.toLocaleLowerCase('es').includes(query)
      const matchesCategory = category === 'Todas' || video.categoria === category
      return matchesTitle && matchesCategory
    })
  }, [videos, search, category])

  function updateVideo(updated: Video) {
    setVideos((current) => current.map((video) => video.id === updated.id ? updated : video))
    setSelected(updated)
  }

  return (
    <>
      <section className="hero-section" id="inicio">
        <div className="hero-content">
          <span className="eyebrow eyebrow--light">Tu aula, en cualquier lugar</span>
          <h1>Aprende nuevas habilidades.<br /><em>Transforma tu futuro.</em></h1>
          <p>Explora clases creadas para impulsar tu crecimiento académico y profesional, a tu propio ritmo.</p>
          <a className="button button--light" href="#catalogo">Explorar catálogo <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-orbit visual-orbit--one" />
          <div className="visual-orbit visual-orbit--two" />
          <div className="visual-card">
            <span>▶</span>
            <strong>Aprende.</strong>
            <strong>Practica.</strong>
            <strong>Crece.</strong>
          </div>
          <div className="floating-note floating-note--top">+ 10 clases</div>
          <div className="floating-note floating-note--bottom">✓ A tu ritmo</div>
        </div>
      </section>

      <section className="catalog-section" id="catalogo">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Catálogo educativo</span>
            <h2>Encuentra tu próxima clase</h2>
            <p>Contenido práctico para seguir avanzando.</p>
          </div>
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Buscar por título</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar una clase…" />
          </label>
        </div>

        <div className="category-filter" id="categorias" aria-label="Filtrar por categoría">
          {['Todas', ...categories].map((item) => (
            <button key={item} type="button" className={category === item ? 'active' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>

        <div aria-live="polite">
          {loading ? (
            <div className="status-panel"><span className="spinner" /><h3>Cargando clases…</h3><p>Estamos preparando el catálogo para ti.</p></div>
          ) : error ? (
            <div className="status-panel status-panel--error"><span className="status-icon">!</span><h3>No pudimos cargar el catálogo</h3><p>{error}</p><button className="button button--primary" type="button" onClick={() => setReloadKey((key) => key + 1)}>Intentar de nuevo</button></div>
          ) : filtered.length === 0 ? (
            <div className="status-panel"><span className="status-icon">⌕</span><h3>No encontramos resultados</h3><p>Prueba con otro título o selecciona una categoría diferente.</p><button className="button button--ghost" type="button" onClick={() => { setSearch(''); setCategory('Todas') }}>Limpiar filtros</button></div>
          ) : (
            <>
              <p className="results-count">{filtered.length} {filtered.length === 1 ? 'clase encontrada' : 'clases encontradas'}</p>
              <div className="video-grid">
                {filtered.map((video) => <VideoCard key={video.id} video={video} onSelect={setSelected} />)}
              </div>
            </>
          )}
        </div>
      </section>

      {selected && (
        <VideoModal video={selected} onClose={() => setSelected(null)} onUpdate={updateVideo} onRequireAuth={onRequireAuth} />
      )}
    </>
  )
}
