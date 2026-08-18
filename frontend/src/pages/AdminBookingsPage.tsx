import { api } from '@/api/client'
import { ErrorAlert } from '@/components/ErrorAlert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAsync } from '@/hooks/use-async'
import { formatBookingWhen } from '@/lib/dates'

export function AdminBookingsPage() {
  const owner = useAsync(() => api.getOwner(), [])
  const bookings = useAsync(() => api.listUpcomingBookings(), [])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Кабинет владельца</p>
        <h1 className="text-2xl font-medium tracking-tight">Предстоящие встречи</h1>
        <p className="mt-1 text-muted-foreground">
          {owner.data
            ? `${owner.data.displayName} · часовой пояс ${owner.data.timezone}`
            : 'Все бронирования всех типов событий в одном списке.'}
        </p>
      </div>

      {owner.error && <ErrorAlert title="Не удалось загрузить профиль" message={owner.error} />}
      {bookings.error && (
        <ErrorAlert title="Не удалось загрузить встречи" message={bookings.error} />
      )}

      {bookings.loading && <Skeleton className="h-48" />}

      {bookings.data && bookings.data.length === 0 && (
        <p className="text-sm text-muted-foreground">Предстоящих встреч пока нет.</p>
      )}

      {bookings.data && bookings.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Когда</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Гость</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.data.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{formatBookingWhen(booking.startAt, booking.endAt)}</TableCell>
                  <TableCell>{booking.eventTypeTitle}</TableCell>
                  <TableCell>{booking.guestName}</TableCell>
                  <TableCell>{booking.guestEmail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
