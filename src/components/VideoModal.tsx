import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import type { Comentario, Video } from '../types'
import { ApiError, getErrorMessage } from '../utils/errors'
import { formatDate, initials } from '../utils/format'

interface VideoModalProps {
  video: Video
  onClose: () => void
  onUpdate: (video: Video) => void
  onRequireAuth: () => void
}

export function VideoModal({ video, onClose, onUpdate, onRequireAuth }: VideoModalProps) {
  const { session } = useAuth()
  const [comment, setComment] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [reply, setReply] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const [feedback, setFeedback] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const hasLike = Boolean(session && video.usuariosLikes.includes(session.estudiante.carne))

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    document.body.classList.add('modal-open')
    dialogRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && dialogRef.current) {
        const elements = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input, textarea, video, [href], [tabindex]:not([tabindex="-1"])')]
        const first = elements[0]
        const last = elements.at(-1)
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

  function requireAuth() {
    onClose()
    onRequireAuth()
  }

  function handleRestricted(action: () => void) {
    if (!session) {
      requireAuth()
      return
    }
    action()
  }

  async function refreshVideo(successMessage: string) {
    const updated = await api.getVideo(video.id)
    onUpdate(updated)
    setFeedback(successMessage)
  }

  function handleApiError(error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      setFeedback('Tu sesión ya no es válida. Cierra la ventana e inicia sesión nuevamente.')
    } else if (error instanceof ApiError && error.status === 403) {
      setFeedback('No tienes permiso para realizar esta acción.')
    } else {
      setFeedback(getErrorMessage(error))
    }
  }

  async function toggleLike() {
    if (!session || busyAction) return
    setBusyAction('like')
    setFeedback('')
    try {
      await api.toggleLike(video.id, session.estudiante.carne)
      await refreshVideo(hasLike ? 'Se quitó tu me gusta.' : '¡Gracias por indicar que te gusta!')
    } catch (error) {
      handleApiError(error)
    } finally {
      setBusyAction('')
    }
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault()
    if (!session) {
      requireAuth()
      return
    }
    const text = comment.trim()
    if (!text) {
      setFeedback('Escribe un comentario antes de publicarlo.')
      return
    }
    setBusyAction('comment')
    setFeedback('')
    try {
      await api.createComentario(video.id, session.estudiante.carne, text)
      setComment('')
      await refreshVideo('Tu comentario fue publicado.')
    } catch (error) {
      handleApiError(error)
    } finally {
      setBusyAction('')
    }
  }

  async function submitReply(event: FormEvent, comentarioId: number) {
    event.preventDefault()
    if (!session) {
      requireAuth()
      return
    }
    const text = reply.trim()
    if (!text) {
      setFeedback('Escribe una respuesta antes de publicarla.')
      return
    }
    setBusyAction(`reply-${comentarioId}`)
    setFeedback('')
    try {
      await api.createRespuesta(comentarioId, session.estudiante.carne, text)
      setReply('')
      setReplyTo(null)
      await refreshVideo('Tu respuesta fue publicada.')
    } catch (error) {
      handleApiError(error)
    } finally {
      setBusyAction('')
    }
  }

  async function deleteComment(comentario: Comentario) {
    if (!session || comentario.carne !== session.estudiante.carne || busyAction) return
    if (!window.confirm('¿Deseas eliminar este comentario? Esta acción no se puede deshacer.')) return
    setBusyAction(`delete-${comentario.id}`)
    setFeedback('')
    try {
      await api.deleteComentario(comentario.id, session.estudiante.carne)
      await refreshVideo('El comentario fue eliminado.')
    } catch (error) {
      handleApiError(error)
    } finally {
      setBusyAction('')
    }
  }

  return (
    <div className="modal-backdrop video-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="video-dialog" role="dialog" aria-modal="true" aria-labelledby="video-title" ref={dialogRef} tabIndex={-1}>
        <button className="icon-button video-close" type="button" onClick={onClose} aria-label="Cerrar video">×</button>
        <div className="player-wrap">
          <video src={video.urlVideo} poster={video.poster} controls autoPlay playsInline>
            Tu navegador no puede reproducir este video.
          </video>
        </div>
        <div className="video-detail">
          <div className="video-detail__main">
            <div className="detail-topline">
              <span className="category-pill">{video.categoria}</span>
              <span>{video.duracion} min</span>
            </div>
            <h2 id="video-title">{video.titulo}</h2>
            <p>{video.descripcion}</p>
          </div>
          <button
            className={`like-button ${hasLike ? 'liked' : ''}`}
            type="button"
            disabled={busyAction === 'like'}
            aria-pressed={hasLike}
            onClick={() => handleRestricted(() => void toggleLike())}
          >
            <span aria-hidden="true">{hasLike ? '♥' : '♡'}</span>
            {busyAction === 'like' ? 'Guardando…' : hasLike ? 'Te gusta' : 'Me gusta'}
            <strong>{video.likes}</strong>
          </button>
        </div>

        <section className="comments-section" aria-labelledby="comments-title">
          <div className="comments-heading">
            <div><span className="eyebrow">Comunidad</span><h3 id="comments-title">Comentarios <span>{video.comentarios.length}</span></h3></div>
            {!session && <button className="text-button" type="button" onClick={requireAuth}>Inicia sesión para participar</button>}
          </div>

          <form className="comment-form" onSubmit={submitComment}>
            <label className="sr-only" htmlFor="new-comment">Escribe un comentario</label>
            <textarea id="new-comment" value={comment} onChange={(event) => setComment(event.target.value)} onFocus={() => !session && requireAuth()} placeholder={session ? 'Comparte qué aprendiste o haz una pregunta…' : 'Inicia sesión para comentar…'} rows={3} maxLength={1000} />
            <button className="button button--primary" type="submit" disabled={busyAction === 'comment'}>{busyAction === 'comment' ? 'Publicando…' : 'Publicar comentario'}</button>
          </form>

          {feedback && <div className="inline-feedback" role="status">{feedback}</div>}

          {video.comentarios.length === 0 ? (
            <div className="empty-comments"><span>✦</span><p>Aún no hay comentarios.</p><small>Sé la primera persona en compartir una idea.</small></div>
          ) : (
            <div className="comment-list">
              {video.comentarios.map((item) => (
                <article className="comment" key={item.id}>
                  <span className="avatar avatar--comment">{initials(item.estudiante)}</span>
                  <div className="comment-content">
                    <div className="comment-author"><strong>{item.estudiante}</strong><time dateTime={item.fecha}>{formatDate(item.fecha)}</time></div>
                    <p>{item.texto}</p>
                    <div className="comment-actions">
                      <button type="button" onClick={() => handleRestricted(() => { setReplyTo(replyTo === item.id ? null : item.id); setReply('') })}>Responder</button>
                      {session?.estudiante.carne === item.carne && (
                        <button className="danger-link" type="button" disabled={busyAction === `delete-${item.id}`} onClick={() => void deleteComment(item)}>{busyAction === `delete-${item.id}` ? 'Eliminando…' : 'Eliminar'}</button>
                      )}
                    </div>

                    {item.respuestas.map((answer) => (
                      <div className="reply" key={answer.id}>
                        <span className="avatar avatar--reply">{initials(answer.estudiante)}</span>
                        <div><div className="comment-author"><strong>{answer.estudiante}</strong><time dateTime={answer.fecha}>{formatDate(answer.fecha)}</time></div><p>{answer.texto}</p></div>
                      </div>
                    ))}

                    {replyTo === item.id && (
                      <form className="reply-form" onSubmit={(event) => void submitReply(event, item.id)}>
                        <label className="sr-only" htmlFor={`reply-${item.id}`}>Responder a {item.estudiante}</label>
                        <input id={`reply-${item.id}`} autoFocus value={reply} onChange={(event) => setReply(event.target.value)} maxLength={1000} placeholder={`Responder a ${item.estudiante}…`} />
                        <button className="button button--primary" type="submit" disabled={busyAction === `reply-${item.id}`}>{busyAction === `reply-${item.id}` ? 'Enviando…' : 'Enviar'}</button>
                        <button className="button button--ghost" type="button" onClick={() => setReplyTo(null)}>Cancelar</button>
                      </form>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
