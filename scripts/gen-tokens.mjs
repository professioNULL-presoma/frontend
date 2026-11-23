// Generates src/styles/tokens.css from the frontmatter of toss.md (single source of truth).
// `--check` fails when the committed file is stale.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const src = readFileSync('toss.md', 'utf8')
const fm = src.split(/^---$/m)[1]
const lines = fm.split('\n')
const out = []
let section = ''
for (const line of lines) {
  const h = line.match(/^([a-z]+):\s*$/)
  if (h) {
    section = h[1]
    continue
  }
  if (!['colors', 'spacing', 'rounded', 'elevation'].includes(section)) continue
  const m = line.match(/^ {2}([\w-]+):\s*(.+?)(?:\s+#\s.*)?$/)
  if (!m) continue
  let [, name, value] = m
  if (value.startsWith('"{')) {
    const ref = value.match(/\{colors\.([\w-]+)\}/)
    if (!ref) continue
    value = `var(--color-${ref[1]})`
  }
  const prefix = { colors: 'color', spacing: 'space', rounded: 'radius', elevation: 'shadow' }[
    section
  ]
  const key = name.replace(/^(space|radius|shadow)-/, '')
  out.push(`  --${prefix}-${key}: ${value};`)
}
const css = `/* GENERATED from toss.md by scripts/gen-tokens.mjs. Do not edit. */\n:root {\n${out.join('\n')}\n}\n`
const target = 'src/styles/tokens.css'
if (process.argv.includes('--check')) {
  if (!existsSync(target) || readFileSync(target, 'utf8') !== css) {
    console.error('✗ tokens.css is stale. Run: npm run tokens')
    process.exit(1)
  }
} else writeFileSync(target, css)
