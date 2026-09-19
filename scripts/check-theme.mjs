/**
 * Advisory theme audit — see docs/ARCHITECTURE.md "Localization, direction,
 * theme". Flags literal colors that usually mean a surface won't adapt to
 * dark mode (bg-white/text-black/#fff/#000 family). This is intentionally
 * NOT a hard CI gate: the codebase legitimately uses hardcoded colors for
 * brand marks, status/severity badges, and chart series, and a rule that
 * can't tell those apart from an accidental light-only surface would
 * either miss real bugs or drown them in noise. Run `npm run check:theme`
 * and read the output — it reports counts and locations, never fails the
 * build.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

const SUSPECT_PATTERNS = [
  { id: 'bg-white', pattern: /\bbg-white\b/g },
  { id: 'text-black', pattern: /\btext-black\b/g },
  { id: 'hex-white', pattern: /#fff(?:fff)?\b/gi },
  { id: 'hex-black', pattern: /#000(?:000)?\b/gi },
]

// Directories/files where literal white/black is legitimate (brand marks,
// chart color scales, generated vendor CSS) — extend deliberately, not to
// silence a real finding.
const ALLOW_SUBSTRINGS = ['data-table - Copy', '/visual-flow/visual-flow.css', 'lucide-react']

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return walk(path)
    return /\.(jsx?|css)$/.test(entry.name) ? [path] : []
  })
}

const files = walk(root).filter((file) => !ALLOW_SUBSTRINGS.some((needle) => file.includes(needle)))

const findings = []
for (const file of files) {
  const relPath = relative(root, file).replaceAll('\\', '/')
  const source = readFileSync(file, 'utf8')
  const lines = source.split('\n')

  for (const { id, pattern } of SUSPECT_PATTERNS) {
    lines.forEach((line, index) => {
      pattern.lastIndex = 0
      if (pattern.test(line)) {
        findings.push({ file: relPath, line: index + 1, kind: id, text: line.trim().slice(0, 120) })
      }
    })
  }
}

console.log(`Theme audit (advisory): scanned ${files.length} files, ${findings.length} suspect literal-color occurrences.`)
if (findings.length) {
  const byKind = findings.reduce((acc, f) => ({ ...acc, [f.kind]: (acc[f.kind] || 0) + 1 }), {})
  console.log('By kind:', byKind)
  console.log('\nTop occurrences (first 40 — re-run with FULL=1 for everything):')
  const toShow = process.env.FULL ? findings : findings.slice(0, 40)
  toShow.forEach((f) => console.log(`  ${f.file}:${f.line}  [${f.kind}]  ${f.text}`))
  console.log('\nThis is advisory only — review each occurrence. Legitimate brand/status/chart colors are NOT violations. Exit code stays 0.')
} else {
  console.log('No suspect literal colors found by this heuristic.')
}
