import type { Booking, DurationMinutes, Slot } from './types.ts'

const WORK_START_HOUR = 9
const WORK_END_HOUR = 18
const WINDOW_DAYS = 14

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function addUtcDays(date: Date, days: number): Date {
  const next = startOfUtcDay(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function bookingWindow(now: Date): { start: Date; end: Date } {
  const start = startOfUtcDay(now)
  return { start, end: addUtcDays(start, WINDOW_DAYS) }
}

export function isInBookingWindow(startAt: Date, now: Date): boolean {
  const { start, end } = bookingWindow(now)
  return startAt >= start && startAt < end
}

export function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && startB < endA
}

export function overlapsAny(startAt: Date, endAt: Date, bookings: Booking[]): boolean {
  return bookings.some((booking) =>
    overlaps(startAt, endAt, new Date(booking.startAt), new Date(booking.endAt)),
  )
}

function isWeekday(date: Date): boolean {
  const day = date.getUTCDay()
  return day >= 1 && day <= 5
}

export function slotEnd(startAt: Date, durationMinutes: DurationMinutes): Date {
  return new Date(startAt.getTime() + durationMinutes * 60 * 1000)
}

export function isOnAvailabilityGrid(startAt: Date, durationMinutes: DurationMinutes): boolean {
  if (!isWeekday(startAt)) return false
  if (startAt.getUTCSeconds() !== 0 || startAt.getUTCMilliseconds() !== 0) return false

  const minutesFromWorkStart = (startAt.getUTCHours() - WORK_START_HOUR) * 60 + startAt.getUTCMinutes()
  if (minutesFromWorkStart < 0) return false
  if (minutesFromWorkStart % durationMinutes !== 0) return false

  const endAt = slotEnd(startAt, durationMinutes)
  const dayEnd = Date.UTC(
    startAt.getUTCFullYear(),
    startAt.getUTCMonth(),
    startAt.getUTCDate(),
    WORK_END_HOUR,
    0,
    0,
    0,
  )
  return endAt.getTime() <= dayEnd
}

export function listFreeSlots(
  durationMinutes: DurationMinutes,
  bookings: Booking[],
  now = new Date(),
): Slot[] {
  const { start, end } = bookingWindow(now)
  const durationMs = durationMinutes * 60 * 1000
  const slots: Slot[] = []

  for (let day = new Date(start); day < end; day = addUtcDays(day, 1)) {
    if (!isWeekday(day)) continue
    const dayStart = Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      WORK_START_HOUR,
      0,
      0,
      0,
    )
    const dayEnd = Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      WORK_END_HOUR,
      0,
      0,
      0,
    )

    for (let time = dayStart; time + durationMs <= dayEnd; time += durationMs) {
      const startAt = new Date(time)
      if (startAt.getTime() <= now.getTime()) continue
      const endAt = new Date(time + durationMs)
      if (overlapsAny(startAt, endAt, bookings)) continue
      slots.push({ startAt: startAt.toISOString(), endAt: endAt.toISOString() })
    }
  }

  return slots
}
