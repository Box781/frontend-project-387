import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const API_PORT = 3001
const UI_PORT = 4173

export const API_URL = `http://127.0.0.1:${API_PORT}`
export const UI_URL = `http://127.0.0.1:${UI_PORT}`

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: UI_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'ru-RU',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.CI ? {} : { channel: 'chrome' as const }),
      },
    },
  ],
  webServer: [
    {
      command: 'npm run start',
      cwd: path.join(root, 'backend'),
      url: `${API_URL}/public/event-types`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: { ...process.env, PORT: String(API_PORT) },
    },
    {
      command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
      cwd: path.join(root, 'frontend'),
      url: UI_URL,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { ...process.env, VITE_API_BASE_URL: API_URL },
    },
  ],
})
