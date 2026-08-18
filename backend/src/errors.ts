export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'SLOT_OUTSIDE_WINDOW'
  | 'SLOT_NOT_AVAILABLE'
  | 'NOT_FOUND'
  | 'SLOT_OCCUPIED'
  | 'EVENT_TYPE_ID_TAKEN'

export class HttpError extends Error {
  readonly status: 400 | 404 | 409
  readonly code: ErrorCode

  constructor(status: 400 | 404 | 409, code: ErrorCode, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
  }
}

export function errorBody(error: HttpError) {
  return { code: error.code, message: error.message }
}
