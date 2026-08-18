import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const reportDir = process.argv[2] ?? 'lhci-reports'

function scorePct(score) {
  if (typeof score !== 'number') return '—'
  return `${Math.round(score * 100)}`
}

function failedAudits(lhr) {
  return Object.values(lhr.audits ?? {})
    .filter((audit) => audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== 'informative')
    .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
    .slice(0, 12)
    .map((audit) => `- ${audit.title} (${scorePct(audit.score)})`)
}

const files = (await readdir(reportDir))
  .filter((name) => name.endsWith('.json') && !name.includes('manifest'))
  .sort()

if (files.length === 0) {
  throw new Error(`No Lighthouse JSON in ${reportDir}`)
}

const lines = ['## Lighthouse', '']

for (const file of files) {
  const lhr = JSON.parse(await readFile(join(reportDir, file), 'utf8'))
  const url = lhr.finalDisplayedUrl ?? lhr.finalUrl ?? lhr.requestedUrl
  const cats = lhr.categories ?? {}
  lines.push(`### ${url}`)
  lines.push('')
  lines.push(
    [
      `- Performance: ${scorePct(cats.performance?.score)}`,
      `- Accessibility: ${scorePct(cats.accessibility?.score)}`,
      `- Best Practices: ${scorePct(cats['best-practices']?.score)}`,
      `- SEO: ${scorePct(cats.seo?.score)}`,
    ].join('\n'),
  )
  const failed = failedAudits(lhr)
  if (failed.length > 0) {
    lines.push('')
    lines.push('Слабые аудиты:')
    lines.push(...failed)
  }
  lines.push('')
}

const markdown = `${lines.join('\n')}\n`
process.stdout.write(markdown)

if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFile } = await import('node:fs/promises')
  await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown)
}
