import { format, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Slot } from '@/api/types'

function toUtcDate(iso: string): Date {
  const d = new Date(iso)
  return new Date(d.getTime() + d.getTimezoneOffset() * 60_000)
}

function utcTime(iso: string) {
  const d = new Date(iso)
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function formatSlotTime(iso: string) {
  return utcTime(iso)
}

export function formatSlotRange(startAt: string, endAt: string) {
  const dateStr = format(toUtcDate(startAt), 'd MMMM yyyy', { locale: ru })
  return `${dateStr}, ${utcTime(startAt)} – ${utcTime(endAt)} UTC`
}

export function formatBookingWhen(startAt: string, endAt: string) {
  const dayStr = format(toUtcDate(startAt), 'EEEE, d MMMM yyyy', { locale: ru })
  return `${dayStr}, ${utcTime(startAt)}–${utcTime(endAt)} UTC`
}

export function slotsOnDay(slots: Slot[], day: Date) {
  return slots
    .filter((slot) => isSameDay(toUtcDate(slot.startAt), day))
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
}

export function daysWithSlots(slots: Slot[]) {
  const seen = new Map<string, Date>()
  for (const slot of slots) {
    const d = toUtcDate(slot.startAt)
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
    if (!seen.has(key)) seen.set(key, d)
  }
  return [...seen.values()]
}
