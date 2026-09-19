/**
 * Advisory hardcoded-UI-text scanner — see docs/ARCHITECTURE.md
 * "Localization, direction, theme" and DEVELOPMENT_ROADMAP.md priority 5.
 *
 * Detects raw Arabic-script string literals and conservative English UI
 * candidates in JS/JSX source outside
 * `src/locales/`. Every translation KEY in this codebase is an English
 * dot-path (e.g. `t('leads.title')`), so any Arabic text found inside a
 * `.js`/`.jsx` file is — by construction — either a hardcoded UI string
 * that should move into the matching `locales/{ar,en}/<domain>.js` module,
 * or an intentional `t(key, 'fallback text')` default. This script does not try to tell
 * those apart (that needs human judgement); it reports COUNTS and
 * LOCATIONS so they can be triaged, same spirit as check-theme.mjs.
 *
 * Deliberately narrow signal (Arabic-script literals only) to avoid
 * false positives on English strings, which are far harder to
 * distinguish from legitimate technical text (class names, log messages,
 * enum values) without an AST-aware pass. Exit code stays 0 — advisory.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const ARABIC_RANGE = /[؀-ۿݐ-ݿ]/
const ENGLISH_UI = [
  />\s*[A-Za-z][A-Za-z ,.!?'-]{2,}\s*</,
  /\b(?:placeholder|title|aria-label|alt)\s*=\s*["'][A-Za-z][^"']{2,}["']/,
  /\b(?:toast\.(?:success|error|warning|info)|window\.confirm)\s*\(\s*["'][A-Za-z][^"']{2,}["']/,
  /\b(?:label|header|emptyMessage|confirmText|cancelText)\s*:\s*["'][A-Za-z][^"']{2,}["']/,
]

// Directories that legitimately contain Arabic outside translation files
// (Arabic-language docs, mock/demo data meant to look realistic).
const ALLOW_SUBSTRINGS = ['/locales/', '.md', 'mock/', 'Mock', 'Demo']

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return walk(path)
    return /\.jsx?$/.test(entry.name) ? [path] : []
  })
}

const files = walk(root).filter((file) => {
  const normalized = file.replaceAll('\\', '/')
  return !ALLOW_SUBSTRINGS.some((needle) => normalized.includes(needle))
})

const findingsByFile = new Map()
const englishByFile = new Map()
let totalLines = 0
let fallbackLines = 0
let englishLines = 0

for (const file of files) {
  const relPath = relative(root, file).replaceAll('\\', '/')
  const source = readFileSync(file, 'utf8')
  const lines = source.split('\n')

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return // comments
    if (ARABIC_RANGE.test(line)) {
      totalLines += 1
      if (/\bt\s*\(|\bi18n\.t\s*\(/.test(line)) fallbackLines += 1
      if (!findingsByFile.has(relPath)) findingsByFile.set(relPath, [])
      findingsByFile.get(relPath).push({ line: index + 1, text: trimmed.slice(0, 140) })
    }
    if (ENGLISH_UI.some((pattern) => pattern.test(line))) {
      englishLines += 1
      if (!englishByFile.has(relPath)) englishByFile.set(relPath, [])
      englishByFile.get(relPath).push({ line: index + 1, text: trimmed.slice(0, 140) })
    }
  })
}

const rankedFiles = [...findingsByFile.entries()].sort((a, b) => b[1].length - a[1].length)

console.log(`Hardcoded-text audit (advisory): scanned ${files.length} files, ${totalLines} lines contain raw Arabic-script literals across ${findingsByFile.size} files.`)
console.log(`Arabic candidates containing a t()/i18n.t() call: ${fallbackLines} (mixed lines need manual review).`)
console.log(`Conservative English UI candidates: ${englishLines} lines across ${englishByFile.size} files.`)
console.log('This includes intentional `t(key, \'fallback\')` defaults as well as genuine hardcoded strings — triage manually.\n')

if (rankedFiles.length) {
  console.log('Top files by occurrence count (first 25 — re-run with FULL=1 for everything):')
  const toShow = process.env.FULL ? rankedFiles : rankedFiles.slice(0, 25)
  toShow.forEach(([file, hits]) => console.log(`  ${String(hits.length).padStart(4)}  ${file}`))
  if (process.env.DETAIL === '1') {
    toShow.forEach(([file, hits]) => hits.forEach((hit) => console.log(`  ${file}:${hit.line} ${hit.text}`)))
  }
} else {
  console.log('No raw Arabic-script literals found outside src/locales/.')
}

if (englishByFile.size) {
  console.log('\nTop English UI candidates (first 25):')
  const rankedEnglish = [...englishByFile.entries()].sort((a, b) => b[1].length - a[1].length)
  const toShow = process.env.FULL ? rankedEnglish : rankedEnglish.slice(0, 25)
  toShow.forEach(([file, hits]) => console.log(`  ${String(hits.length).padStart(4)}  ${file}`))
  if (process.env.DETAIL === '1') {
    toShow.forEach(([file, hits]) => hits.forEach((hit) => console.log(`  ${file}:${hit.line} ${hit.text}`)))
  }
}

console.log('\nExit code stays 0 — this is a triage input, not a CI gate.')
