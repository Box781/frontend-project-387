export const DURATION_MINUTES = [15, 30, 45, 60] as const

export type DurationMinutes = (typeof DURATION_MINUTES)[number]

export type Owner = {
  id: string
  displayName: string
  timezone: 'UTC'
}

export type EventType = {
  id: string
  title: string
  description: string
  durationMinutes: DurationMinutes
}

export type CreateEventTypeRequest = {
  id: string
  title: string
  description: string
  durationMinutes: DurationMinutes
}

export type Slot = {
  startAt: string
  endAt: string
}

export type CreateBookingRequest = {
  eventTypeId: string
  startAt: string
  guestName: string
  guestEmail: string
}

export type Booking = {
  id: string
  eventTypeId: string
  eventTypeTitle: string
  startAt: string
  endAt: string
  guestName: string
  guestEmail: string
}

export type ApiErrorBody = {
  code?:
    | 'VALIDATION_ERROR'
    | 'SLOT_OUTSIDE_WINDOW'
    | 'SLOT_NOT_AVAILABLE'
    | 'NOT_FOUND'
    | 'SLOT_OCCUPIED'
    | 'EVENT_TYPE_ID_TAKEN'
  message?: string
}
