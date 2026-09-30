/**
 * Strict i18n + theme gate for the Customer Service area.
 *
 * The repo-wide `check:theme` and `check:hardcoded-text` are advisory because
 * legacy code has thousands of findings. The Service area is new, so it starts
 * clean and must stay clean: this script FAILS on any finding inside
 *   src/features/service/**, src/pages/service/**, src/features/portal/** and src/portal/** (customer portal)
 * (mocks, tests and README files are excluded — demo data may contain text).
 *
 * Rules:
 *  - no raw Arabic-script literals in code (copy goes to src/locales/{ar,en}/service*)
 *  - no obvious English UI literals (JSX text, placeholder/title/aria-label/alt)
 *  - no light-only colors (bg-white, text-black, #fff, #000) — use CSS variables
 *  - no raw hex colors in class names (bg-[#...], text-[#...], border-[#...]) — add a token
 *  - no forced dir="rtl" (dir="ltr" is allowed for numbers, codes, emails)
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const srcRoot = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const SCOPES = ['features/service', 'pages/service', 'features/portal', 'portal']
const EXCLUDE = ['/mocks/', '.test.', '.md']

const RULES = [
  { id: 'arabic-literal', pattern: /[؀-ۿݐ-ݿ]/ },
  { id: 'english-jsx-text', pattern: />\s*[A-Za-z][A-Za-z ,.!?'-]{2,}\s*</ },
  { id: 'english-attribute', pattern: /\b(?:placeholder|title|aria-label|alt)\s*=\s*["'][A-Za-z][^"']{2,}["']/ },
  { id: 'light-only-color', pattern: /\bbg-white\b|\btext-black\b|#fff(?:fff)?\b|#000(?:000)?\b/i },
  { id: 'raw-hex-class', pattern: /\b(?:bg|text|border|ring|from|to|via|fill|stroke)-\[#[0-9a-f]{3,8}\]/i },
  { id: 'forced-rtl', pattern: /dir\s*=\s*["']rtl["']/ },
]

function walk(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return walk(path)
    return /\.(jsx?|css)$/.test(entry.name) ? [path] : []
  })
}

const files = SCOPES.flatMap((scope) => walk(join(srcRoot, scope))).filter((file) => {
  const normalized = file.replaceAll('\\', '/')
  return !EXCLUDE.some((needle) => normalized.includes(needle))
})

const findings = []
for (const file of files) {
  const relPath = relative(srcRoot, file).replaceAll('\\', '/')
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return
      RULES.forEach(({ id, pattern }) => {
        if (pattern.test(line)) findings.push(`  ${relPath}:${index + 1}  [${id}]  ${trimmed.slice(0, 110)}`)
      })
    })
}

console.log(`Service i18n/theme gate: scanned ${files.length} files in ${SCOPES.join(', ')}`)
if (findings.length) {
  console.error(`FAIL — ${findings.length} finding(s):\n${findings.join('\n')}`)
  console.error('\nMove copy to src/locales/{ar,en}/service*, use CSS variables/tokens, keep direction logical.')
  process.exitCode = 1
} else {
  console.log('Service i18n/theme gate: PASS')
}
