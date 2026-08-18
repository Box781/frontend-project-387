import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { serveStatic } from '@hono/node-server/serve-static'
import type { Context, Hono } from 'hono'

const publicDir = process.env.PUBLIC_DIR
  ? path.resolve(process.env.PUBLIC_DIR)
  : undefined

const indexPath = publicDir ? path.join(publicDir, 'index.html') : undefined

export function isSpaDocumentRequest(c: Context): boolean {
  if (!indexPath || !existsSync(indexPath)) {
    return false
  }
  return (c.req.header('Accept') ?? '').includes('text/html')
}

export async function spaIndex(c: Context) {
  if (!indexPath) {
    return c.json({ message: 'Frontend is not bundled' }, 404)
  }
  const html = await readFile(indexPath, 'utf8')
  return c.html(html)
}

export function mountFrontend(app: Hono) {
  if (!publicDir || !indexPath || !existsSync(indexPath)) {
    return
  }

  const root = path.relative(process.cwd(), publicDir) || '.'

  app.use('/assets/*', serveStatic({ root }))
  app.use('/favicon.svg', serveStatic({ root }))
  app.use('/icons.svg', serveStatic({ root }))

  app.get('/', spaIndex)
  app.get('/booked', spaIndex)
  app.get('/book/:eventTypeId', spaIndex)
  app.get('/admin', spaIndex)

  app.notFound(async (c) => {
    if (isSpaDocumentRequest(c)) {
      return spaIndex(c)
    }
    return c.json({ message: 'Not found' }, 404)
  })
}
