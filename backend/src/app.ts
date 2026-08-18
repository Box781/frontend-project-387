import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorBody, HttpError } from './errors.ts'
import {
  listFreeSlots,
  isInBookingWindow,
  isOnAvailabilityGrid,
  overlapsAny,
  slotEnd,
} from './slots.ts'
import { isSpaDocumentRequest, mountFrontend, spaIndex } from './frontend.ts'
import { seedStore, store } from './store.ts'
import {
  DURATION_MINUTES,
  EMAIL_PATTERN,
  EVENT_TYPE_ID_PATTERN,
  OWNER,
  type DurationMinutes,
  type EventType,
} from './types.ts'

seedStore()

export const app = new Hono()

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Accept'],
  }),
)

app.onError((error, c) => {
  if (error instanceof HttpError) {
    return c.json(errorBody(error), error.status)
  }
  console.error(error)
  return c.json({ message: 'Internal error' }, 500)
})

app.get('/admin/owner', (c) => c.json(OWNER))

app.get('/admin/event-types', async (c) => {
  if (isSpaDocumentRequest(c)) {
    return spaIndex(c)
  }
  return c.json(store.listEventTypes())
})

app.post('/admin/event-types', async (c) => {
  const body = await readJson(c)
  const eventType = parseEventType(body)
  if (store.getEventType(eventType.id)) {
    throw new HttpError(409, 'EVENT_TYPE_ID_TAKEN', `Тип события «${eventType.id}» уже существует`)
  }
  store.createEventType(eventType)
  return c.json(eventType, 201)
})

app.get('/admin/bookings', (c) => {
  const now = Date.now()
  const upcoming = store
    .listBookings()
    .filter((booking) => Date.parse(booking.startAt) > now)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
  return c.json(upcoming)
})

app.get('/public/event-types', (c) => c.json(store.listEventTypes()))

app.get('/public/event-types/:eventTypeId', (c) => {
  const eventType = requireEventType(c.req.param('eventTypeId'))
  return c.json(eventType)
})

app.get('/public/event-types/:eventTypeId/slots', (c) => {
  const eventType = requireEventType(c.req.param('eventTypeId'))
  return c.json(listFreeSlots(eventType.durationMinutes, store.listBookings()))
})

app.post('/public/bookings', async (c) => {
  const body = await readJson(c)
  const eventTypeId = requiredString(body, 'eventTypeId')
  if (!EVENT_TYPE_ID_PATTERN.test(eventTypeId)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Некорректный eventTypeId')
  }
  const guestName = requiredString(body, 'guestName')
  if (guestName.length > 120) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Имя слишком длинное')
  }
  const guestEmail = requiredString(body, 'guestEmail')
  if (!EMAIL_PATTERN.test(guestEmail)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Некорректный email')
  }

  const eventType = requireEventType(eventTypeId)
  const startAt = parseDate(body.startAt)
  const endAt = slotEnd(startAt, eventType.durationMinutes)
  const now = new Date()

  if (!isInBookingWindow(startAt, now)) {
    throw new HttpError(400, 'SLOT_OUTSIDE_WINDOW', 'Слот вне окна записи на 14 дней')
  }
  if (startAt.getTime() <= now.getTime() || !isOnAvailabilityGrid(startAt, eventType.durationMinutes)) {
    throw new HttpError(400, 'SLOT_NOT_AVAILABLE', 'Этот слот нельзя забронировать')
  }
  if (overlapsAny(startAt, endAt, store.listBookings())) {
    throw new HttpError(409, 'SLOT_OCCUPIED', 'Это время уже занято')
  }

  const booking = {
    id: crypto.randomUUID(),
    eventTypeId: eventType.id,
    eventTypeTitle: eventType.title,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    guestName,
    guestEmail,
  }
  store.addBooking(booking)
  return c.json(booking, 201)
})

async function readJson(c: { req: { json: () => Promise<unknown> } }): Promise<Record<string, unknown>> {
  try {
    const body = await c.req.json()
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Ожидается JSON-объект')
    }
    return body as Record<string, unknown>
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(400, 'VALIDATION_ERROR', 'Некорректный JSON')
  }
}

function requiredString(body: Record<string, unknown>, field: string): string {
  const value = body[field]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', `Поле ${field} обязательно`)
  }
  return value.trim()
}

function parseDate(value: unknown): Date {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Некорректный startAt')
  }
  return new Date(value)
}

function parseEventType(body: Record<string, unknown>): EventType {
  const id = requiredString(body, 'id')
  if (!EVENT_TYPE_ID_PATTERN.test(id) || id.length > 64) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'id: строчные латинские буквы, цифры и дефисы')
  }
  const title = requiredString(body, 'title')
  if (title.length > 120) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Название слишком длинное')
  }
  const description = typeof body.description === 'string' ? body.description : ''
  if (description.length > 2000) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Описание слишком длинное')
  }
  const durationMinutes = body.durationMinutes
  if (!DURATION_MINUTES.includes(durationMinutes as DurationMinutes)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Длительность: 15, 30, 45 или 60 минут')
  }
  return { id, title, description, durationMinutes: durationMinutes as DurationMinutes }
}

function requireEventType(id: string): EventType {
  const eventType = store.getEventType(id)
  if (!eventType) {
    throw new HttpError(404, 'NOT_FOUND', `Тип события «${id}» не найден`)
  }
  return eventType
}

mountFrontend(app)
