import type { ApiErrorBody, Booking, CreateBookingRequest, CreateEventTypeRequest, EventType, Owner, Slot } from './types'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL
export const API_BASE_URL =
  configuredBaseUrl === undefined
    ? import.meta.env.DEV
      ? 'http://localhost:3000'
      : ''
    : configuredBaseUrl.replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code: string | undefined

  constructor(status: number, body: ApiErrorBody | undefined) {
    super(body?.message ?? `Ошибка API (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code
  }
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
    throw new ApiError(0, {
      message: API_BASE_URL
        ? `Не удалось связаться с API (${API_BASE_URL}). Запустите бэкенд или Prism.`
        : 'Не удалось связаться с API.',
    })
  }

  if (!response.ok) {
    let body: ApiErrorBody | undefined
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      body = undefined
    }
    throw new ApiError(response.status, body)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const api = {
  listPublicEventTypes: () => request<EventType[]>('/public/event-types'),

  getPublicEventType: (eventTypeId: string) =>
    request<EventType>(`/public/event-types/${encodeURIComponent(eventTypeId)}`),

  listSlots: (eventTypeId: string) =>
    request<Slot[]>(`/public/event-types/${encodeURIComponent(eventTypeId)}/slots`),

  createBooking: (body: CreateBookingRequest) =>
    request<Booking>('/public/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getOwner: () => request<Owner>('/admin/owner'),

  listAdminEventTypes: () => request<EventType[]>('/admin/event-types'),

  createEventType: (body: CreateEventTypeRequest) =>
    request<EventType>('/admin/event-types', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  listUpcomingBookings: () => request<Booking[]>('/admin/bookings'),
}
