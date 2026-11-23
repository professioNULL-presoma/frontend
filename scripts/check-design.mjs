// Design-system guard: no raw colors or px font sizes outside the generated tokens.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const allowed = new Set(['src/styles/tokens.css'])
const rules = [
  [/#[0-9a-fA-F]{3,8}\b/, 'raw hex color; use var(--color-*)'],
  [/\b(?:rgb|rgba|hsl|hsla|oklch)\(/, 'raw color function; use var(--color-*)'],
]
const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
let bad = 0
for (const f of walk('src').filter((f) => /\.(css|tsx?|html)$/.test(f))) {
  if (allowed.has(f)) continue
  readFileSync(f, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const [re, msg] of rules)
        if (re.test(line)) {
          console.error(`✗ ${f}:${i + 1} ${msg}`)
          bad = 1
        }
    })
}
process.exit(bad)
