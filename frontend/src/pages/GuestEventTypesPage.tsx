import { Link } from 'react-router'
import { Clock } from 'lucide-react'
import { api } from '@/api/client'
import { ErrorAlert } from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAsync } from '@/hooks/use-async'

export function GuestEventTypesPage() {
  const { data, error, loading } = useAsync(() => api.listPublicEventTypes(), [])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Публичная запись</p>
        <h1 className="text-2xl font-medium tracking-tight">Выберите тип встречи</h1>
        <p className="mt-1 text-muted-foreground">
          Свободные слоты показываются на ближайшие 14 дней.
        </p>
      </div>

      {loading && (
        <div className="grid gap-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      )}

      {error && <ErrorAlert title="Не удалось загрузить типы встреч" message={error} />}

      {data && data.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Пока нечего бронировать</CardTitle>
            <CardDescription>
              Владелец ещё не создал типы событий. Откройте раздел «Типы событий».
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4">
        {data?.map((eventType) => (
          <Card key={eventType.id}>
            <CardHeader>
              <CardTitle>{eventType.title}</CardTitle>
              <CardDescription>{eventType.description || 'Без описания'}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                {eventType.durationMinutes} мин
              </p>
              <Button asChild>
                <Link to={`/book/${eventType.id}`}>Выбрать время</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
