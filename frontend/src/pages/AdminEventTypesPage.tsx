import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { api, ApiError } from '@/api/client'
import { DURATION_MINUTES, type DurationMinutes } from '@/api/types'
import { ErrorAlert } from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAsync } from '@/hooks/use-async'

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function AdminEventTypesPage() {
  const list = useAsync(() => api.listAdminEventTypes(), [])
  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(30)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!ID_PATTERN.test(id)) {
      toast.error('id: строчные латинские буквы, цифры и дефисы, например intro-call')
      return
    }
    setSubmitting(true)
    try {
      await api.createEventType({ id, title, description, durationMinutes })
      toast.success('Тип события создан')
      setId('')
      setTitle('')
      setDescription('')
      setDurationMinutes(30)
      list.reload()
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Не удалось создать тип события')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Кабинет владельца</p>
          <h1 className="text-2xl font-medium tracking-tight">Типы событий</h1>
        </div>

        {list.loading && <Skeleton className="h-40" />}
        {list.error && <ErrorAlert title="Не удалось загрузить типы" message={list.error} />}

        {list.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">Типов событий ещё нет — создайте первый справа.</p>
        )}

        <div className="grid gap-3">
          {list.data?.map((eventType) => (
            <Card key={eventType.id}>
              <CardHeader>
                <CardTitle>{eventType.title}</CardTitle>
                <CardDescription>
                  {eventType.id} · {eventType.durationMinutes} мин
                </CardDescription>
              </CardHeader>
              {eventType.description && (
                <CardContent className="text-sm text-muted-foreground">
                  {eventType.description}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Новый тип</CardTitle>
          <CardDescription>id задаёте вы — он станет частью публичной ссылки.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="event-id">id</Label>
              <Input
                id="event-id"
                required
                placeholder="intro-call"
                value={id}
                onChange={(change) => setId(change.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-title">Название</Label>
              <Input
                id="event-title"
                required
                maxLength={120}
                value={title}
                onChange={(change) => setTitle(change.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-description">Описание</Label>
              <Textarea
                id="event-description"
                maxLength={2000}
                value={description}
                onChange={(change) => setDescription(change.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Длительность</Label>
              <Select
                value={String(durationMinutes)}
                onValueChange={(value) => setDurationMinutes(Number(value) as DurationMinutes)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_MINUTES.map((minutes) => (
                    <SelectItem key={minutes} value={String(minutes)}>
                      {minutes} мин
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Сохранение…' : 'Создать'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
