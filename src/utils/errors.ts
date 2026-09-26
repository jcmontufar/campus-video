export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof TypeError) {
    return 'No fue posible conectar con el servidor. Revisa tu conexión e intenta de nuevo.'
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado. Intenta de nuevo.'
}
