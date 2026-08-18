import type { Booking, EventType } from './types.ts'

const eventTypes = new Map<string, EventType>()
const bookings = new Map<string, Booking>()

export const store = {
  listEventTypes(): EventType[] {
    return [...eventTypes.values()]
  },

  getEventType(id: string): EventType | undefined {
    return eventTypes.get(id)
  },

  createEventType(eventType: EventType): void {
    eventTypes.set(eventType.id, eventType)
  },

  listBookings(): Booking[] {
    return [...bookings.values()]
  },

  addBooking(booking: Booking): void {
    bookings.set(booking.id, booking)
  },
}

export function seedStore() {
  if (eventTypes.size > 0) return
  store.createEventType({
    id: 'intro-call',
    title: 'Знакомство',
    description: 'Короткий звонок, чтобы обсудить задачу.',
    durationMinutes: 30,
  })
  store.createEventType({
    id: 'demo',
    title: 'Демо продукта',
    description: 'Покажем, как устроен сервис, и ответим на вопросы.',
    durationMinutes: 45,
  })
}
