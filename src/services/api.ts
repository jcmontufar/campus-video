import type { Categoria, Estudiante, LoginInput, RegistroInput, Sesion, Video } from '../types'
import { ApiError } from '../utils/errors'

export const API_BASE_URL =
  'https://back-semprivado-umg-h6fkf2bng2avgrgw.westus3-01.azurewebsites.net'

type JsonObject = Record<string, unknown>

function extractMessage(body: unknown, fallback: string): string {
  if (typeof body === 'string' && body.trim()) return body
  if (body && typeof body === 'object') {
    const data = body as JsonObject
    for (const key of ['mensaje', 'message', 'error', 'title']) {
      if (typeof data[key] === 'string' && data[key]) return data[key]
    }
    if (data.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors as JsonObject).flat()
      if (messages.length) return messages.join(' ')
    }
  }
  return fallback
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new TypeError('Error de red')
  }

  const contentType = response.headers.get('content-type') ?? ''
  const body: unknown = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '')

  if (!response.ok) {
    const fallback =
      response.status === 401
        ? 'Tu sesión no es válida. Inicia sesión nuevamente.'
        : response.status === 403
          ? 'No tienes permiso para realizar esta acción.'
          : `La solicitud no pudo completarse (${response.status}).`
    throw new ApiError(extractMessage(body, fallback), response.status)
  }

  return body as T
}

function normalizeSession(body: unknown, input: LoginInput): Sesion {
  const root = (body && typeof body === 'object' ? body : {}) as JsonObject
  const candidate = ((root.estudiante ?? root.usuario ?? root.data ?? root) || {}) as JsonObject
  const carne = String(candidate.carne ?? candidate.carnet ?? root.carne ?? '')
  const nombre = String(candidate.nombre ?? candidate.nombreCompleto ?? root.nombre ?? 'Estudiante')
  const correo = String(candidate.correo ?? candidate.email ?? root.correo ?? '')
  const estudiante: Estudiante = {
    carne: carne || (input.identificador.includes('@') ? '' : input.identificador),
    nombre,
    correo: correo || (input.identificador.includes('@') ? input.identificador : ''),
  }
  if (!estudiante.carne) {
    throw new ApiError('El servidor no devolvió el carné del estudiante.', 500)
  }
  const token = root.token ?? root.accessToken
  return { estudiante, token: typeof token === 'string' ? token : undefined }
}

export const api = {
  getVideos: () => request<Video[]>('/api/videos'),
  getVideo: (id: number) => request<Video>(`/api/videos/${id}`),
  getCategorias: () => request<Categoria[]>('/api/videos/categorias'),
  getVideosByCategoria: (categoria: string) =>
    request<Video[]>(`/api/videos/categoria/${encodeURIComponent(categoria)}`),

  async registrar(input: RegistroInput): Promise<void> {
    await request('/api/estudiantes/registrar', {
      method: 'POST',
      body: JSON.stringify({
        carne: input.carne.trim(),
        estudiante: input.nombre.trim(),
        correo: input.correo.trim().toLowerCase(),
        password: input.pin,
      }),
    })
  },

  async login(input: LoginInput): Promise<Sesion> {
    const body = await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ usuario: input.identificador.trim(), password: input.pin }),
    })
    return normalizeSession(body, input)
  },

  toggleLike: (videoId: number, carne: string) =>
    request(`/api/interaccionvideo/${videoId}/like`, {
      method: 'POST',
      body: JSON.stringify({ carne }),
    }),

  createComentario: (videoId: number, carne: string, texto: string) =>
    request(`/api/interaccionvideo/${videoId}/comentario`, {
      method: 'POST',
      body: JSON.stringify({ carne, texto }),
    }),

  createRespuesta: (comentarioId: number, carne: string, texto: string) =>
    request(`/api/interaccionvideo/comentario/${comentarioId}/responder`, {
      method: 'POST',
      body: JSON.stringify({ carne, texto }),
    }),

  deleteComentario: (comentarioId: number, carne: string) =>
    request(
      `/api/interaccionvideo/comentario/${comentarioId}?carne=${encodeURIComponent(carne)}`,
      { method: 'DELETE' },
    ),
}
