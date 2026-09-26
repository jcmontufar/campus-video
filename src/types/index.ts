export interface Estudiante {
  carne: string
  nombre: string
  correo: string
}

export interface Sesion {
  estudiante: Estudiante
  token?: string
}

export interface Respuesta {
  id: number
  carne: string
  estudiante: string
  texto: string
  fecha: string
}

export interface Comentario extends Respuesta {
  respuestas: Respuesta[]
}

export interface Video {
  id: number
  titulo: string
  descripcion: string
  categoria: string
  duracion: string
  urlVideo: string
  poster: string
  likes: number
  usuariosLikes: string[]
  comentarios: Comentario[]
}

export type Categoria = string
export type AuthMode = 'login' | 'registro'

export interface RegistroInput {
  carne: string
  nombre: string
  correo: string
  pin: string
}

export interface LoginInput {
  identificador: string
  pin: string
}
