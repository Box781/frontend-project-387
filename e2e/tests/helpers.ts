import { expect, type Page } from '@playwright/test'

export async function openIntroCall(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Выберите тип встречи' })).toBeVisible()
  await expect(page.getByText('Знакомство')).toBeVisible()
  await page.getByRole('link', { name: 'Выбрать время' }).first().click()
  await expect(page.getByRole('heading', { name: 'Знакомство' })).toBeVisible()
}

export async function pickFirstSlot(page: Page) {
  const day = page.getByRole('button', { name: /2026 г\./, disabled: false }).first()
  await expect(day).toBeVisible()
  const dayName = (await day.getAttribute('aria-label')) ?? ''
  await day.click()

  const slot = page.getByRole('button', { name: /^\d{2}:\d{2}$/ }).first()
  await expect(slot).toBeVisible()
  const time = (await slot.innerText()).trim()
  await slot.click()
  return { dayName, time }
}
