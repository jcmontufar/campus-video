import type { Video } from '../types'

export function VideoCard({ video, onSelect }: { video: Video; onSelect: (video: Video) => void }) {
  return (
    <article className="video-card">
      <button className="poster-button" type="button" onClick={() => onSelect(video)} aria-label={`Reproducir ${video.titulo}`}>
        <img src={video.poster} alt={`Póster de ${video.titulo}`} loading="lazy" />
        <span className="play-button" aria-hidden="true">▶</span>
        <span className="duration">{video.duracion}</span>
      </button>
      <div className="video-card__body">
        <span className="category-pill">{video.categoria}</span>
        <h3><button type="button" onClick={() => onSelect(video)}>{video.titulo}</button></h3>
        <p>{video.descripcion}</p>
        <div className="video-meta">
          <span aria-label={`${video.likes} me gusta`}>♡ {video.likes}</span>
          <span aria-label={`${video.comentarios.length} comentarios`}>◯ {video.comentarios.length}</span>
          <button className="watch-link" type="button" onClick={() => onSelect(video)}>Ver clase <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </article>
  )
}
