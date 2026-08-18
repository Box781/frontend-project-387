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

export type Slot = {
  startAt: string
  endAt: string
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

export const OWNER: Owner = {
  id: 'owner',
  displayName: 'Анна Ковалева',
  timezone: 'UTC',
}

export const EVENT_TYPE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
