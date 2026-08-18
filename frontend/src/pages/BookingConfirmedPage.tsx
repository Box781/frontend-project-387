import { Link, useLocation } from 'react-router'
import { CircleCheck } from 'lucide-react'
import type { Booking } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBookingWhen } from '@/lib/dates'

export function BookingConfirmedPage() {
  const location = useLocation()
  const booking = location.state as Booking | null

  if (!booking) {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Запись не найдена</CardTitle>
            <CardDescription>Откройте список типов встреч и выберите слот заново.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">К записи</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleCheck className="size-5" />
            Вы записаны
          </CardTitle>
          <CardDescription>{booking.eventTypeTitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{formatBookingWhen(booking.startAt, booking.endAt)}</p>
          <p>
            {booking.guestName} · {booking.guestEmail}
          </p>
          <Button asChild className="mt-2">
            <Link to="/">Записать ещё</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
