import { format, isSameDay, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Slot } from '@/api/types'

export function formatSlotTime(iso: string) {
  return format(parseISO(iso), 'HH:mm')
}

export function formatSlotRange(startAt: string, endAt: string) {
  return `${format(parseISO(startAt), 'd MMMM yyyy, HH:mm', { locale: ru })} – ${format(parseISO(endAt), 'HH:mm', { locale: ru })}`
}

export function formatBookingWhen(startAt: string, endAt: string) {
  return `${format(parseISO(startAt), 'EEEE, d MMMM yyyy', { locale: ru })}, ${formatSlotTime(startAt)}–${formatSlotTime(endAt)}`
}

export function slotsOnDay(slots: Slot[], day: Date) {
  return slots
    .filter((slot) => isSameDay(parseISO(slot.startAt), day))
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
}

export function daysWithSlots(slots: Slot[]) {
  return slots.map((slot) => parseISO(slot.startAt))
}
