import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ru } from 'react-day-picker/locale'
import { ArrowLeft, Clock, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { api, ApiError } from '@/api/client'
import type { Slot } from '@/api/types'
import { ErrorAlert } from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAsync } from '@/hooks/use-async'
import { daysWithSlots, formatSlotRange, formatSlotTime, slotsOnDay } from '@/lib/dates'

export function GuestBookPage() {
  const { eventTypeId = '' } = useParams()
  const navigate = useNavigate()
  const [selectedDay, setSelectedDay] = useState<Date | undefined>()
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const eventType = useAsync(() => api.getPublicEventType(eventTypeId), [eventTypeId])
  const slots = useAsync(() => api.listSlots(eventTypeId), [eventTypeId])

  const availableDays = useMemo(
    () => (slots.data ? daysWithSlots(slots.data) : []),
    [slots.data],
  )
  const daySlots = selectedDay && slots.data ? slotsOnDay(slots.data, selectedDay) : []

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!selectedSlot) return
    setSubmitting(true)
    try {
      const booking = await api.createBooking({
        eventTypeId,
        startAt: selectedSlot.startAt,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
      })
      navigate('/booked', { state: booking })
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : 'Не удалось создать запись'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (eventType.loading || slots.loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    )
  }

  if (eventType.error || !eventType.data) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <ErrorAlert
          title="Тип встречи не найден"
          message={eventType.error ?? 'Проверьте ссылку и список типов событий.'}
        />
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft />
            К списку встреч
          </Link>
        </Button>
      </div>
    )
  }

  const event = eventType.data

  if (selectedSlot) {
    return (
      <div className="mx-auto grid max-w-4xl gap-6 rounded-2xl border bg-background p-6 shadow-sm md:grid-cols-[280px_1fr]">
        <aside className="space-y-3 border-b pb-6 md:border-r md:border-b-0 md:pr-6 md:pb-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/">
              <ArrowLeft />
              Назад
            </Link>
          </Button>
          <h1 className="text-xl font-medium">{event.title}</h1>
          <p className="text-sm text-muted-foreground">{event.description}</p>
          <p className="flex items-center gap-2 text-sm">
            <Clock className="size-4" />
            {event.durationMinutes} мин
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Globe className="size-4" />
            Локальное время
          </p>
          <p className="text-sm font-medium">{formatSlotRange(selectedSlot.startAt, selectedSlot.endAt)}</p>
        </aside>

        <form className="space-y-4" onSubmit={onSubmit}>
          <h2 className="text-lg font-medium">Ваши данные</h2>
          <div className="space-y-2">
            <Label htmlFor="guestName">Имя</Label>
            <Input
              id="guestName"
              required
              maxLength={120}
              value={guestName}
              onChange={(change) => setGuestName(change.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guestEmail">Email</Label>
            <Input
              id="guestEmail"
              type="email"
              required
              value={guestEmail}
              onChange={(change) => setGuestEmail(change.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedSlot(null)}
            >
              Назад
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Отправка…' : 'Подтвердить'}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[240px_1fr_220px]">
        <aside className="space-y-3 border-b p-6 lg:border-r lg:border-b-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/">
              <ArrowLeft />
              Все типы
            </Link>
          </Button>
          <h1 className="text-xl font-medium">{event.title}</h1>
          <p className="text-sm text-muted-foreground">{event.description || 'Без описания'}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {event.durationMinutes} мин
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="size-4" />
            Локальное время
          </p>
        </aside>

        <section className="flex justify-center border-b p-4 lg:border-r lg:border-b-0">
          {slots.error ? (
            <ErrorAlert title="Не удалось загрузить слоты" message={slots.error} />
          ) : (
            <Calendar
              mode="single"
              locale={ru}
              selected={selectedDay}
              onSelect={(day) => {
                setSelectedDay(day)
                setSelectedSlot(null)
              }}
              disabled={(date) =>
                !availableDays.some(
                  (available) =>
                    available.getFullYear() === date.getFullYear() &&
                    available.getMonth() === date.getMonth() &&
                    available.getDate() === date.getDate(),
                )
              }
              className="w-full [--cell-size:2.5rem]"
            />
          )}
        </section>

        <section className="max-h-[480px] space-y-3 overflow-y-auto p-4">
          <h2 className="text-sm font-medium">
            {selectedDay ? selectedDay.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }) : 'Выберите день'}
          </h2>
          {!selectedDay && (
            <p className="text-sm text-muted-foreground">
              Активны только дни, для которых API вернул свободные слоты.
            </p>
          )}
          {selectedDay && daySlots.length === 0 && (
            <p className="text-sm text-muted-foreground">На этот день свободных слотов нет.</p>
          )}
          <div className="grid gap-2">
            {daySlots.map((slot) => (
              <Button
                key={slot.startAt}
                variant="outline"
                className="justify-center"
                onClick={() => setSelectedSlot(slot)}
              >
                {formatSlotTime(slot.startAt)}
              </Button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
