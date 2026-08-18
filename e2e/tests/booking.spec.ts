import { expect, test } from '@playwright/test'
import { API_URL } from '../playwright.config'
import { openIntroCall, pickFirstSlot } from './helpers'

test.describe.configure({ mode: 'serial' })

test('гость записывается на слот, владелец видит встречу, слот пропадает', async ({ page, request }) => {
  const guestName = `E2E Гость ${Date.now()}`
  const guestEmail = `e2e.${Date.now()}@example.com`

  await openIntroCall(page)
  const { dayName, time } = await pickFirstSlot(page)

  await expect(page.getByLabel('Имя')).toBeVisible()
  await page.getByLabel('Имя').fill(guestName)
  await page.getByLabel('Email').fill(guestEmail)
  await page.getByRole('button', { name: 'Подтвердить' }).click()

  await expect(page.getByText('Вы записаны')).toBeVisible()
  await expect(page.getByText(guestName)).toBeVisible()
  await expect(page.getByText(guestEmail)).toBeVisible()

  await page.getByRole('link', { name: 'Встречи' }).click()
  await expect(page.getByRole('heading', { name: 'Предстоящие встречи' })).toBeVisible()
  await expect(page.getByRole('cell', { name: guestName })).toBeVisible()
  await expect(page.getByRole('cell', { name: guestEmail })).toBeVisible()

  await openIntroCall(page)
  const sameDay = page.getByRole('button', { name: dayName, disabled: false })
  if (await sameDay.count()) {
    await sameDay.first().click()
    await expect(page.getByRole('button', { name: time, exact: true })).toHaveCount(0)
  }

  const slots = (await request.get(`${API_URL}/public/event-types/intro-call/slots`).then((res) => res.json())) as {
    startAt: string
  }[]
  const remaining = slots[0]
  expect(remaining).toBeTruthy()

  const firstBook = await request.post(`${API_URL}/public/bookings`, {
    data: {
      eventTypeId: 'intro-call',
      startAt: remaining.startAt,
      guestName: 'Конфликт API',
      guestEmail: 'conflict@example.com',
    },
  })
  expect(firstBook.status()).toBe(201)

  const secondBook = await request.post(`${API_URL}/public/bookings`, {
    data: {
      eventTypeId: 'intro-call',
      startAt: remaining.startAt,
      guestName: 'Второй гость',
      guestEmail: 'second@example.com',
    },
  })
  expect(secondBook.status()).toBe(409)
  await expect(secondBook.json()).resolves.toMatchObject({ code: 'SLOT_OCCUPIED' })
})
