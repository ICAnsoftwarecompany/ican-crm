import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const shared = join(root, 'shared')
const knownShellComposition = new Set([
  'shared/components/layout/MainLayout.jsx',
  'shared/components/layout/Header.jsx',
  'shared/components/data/PageToolbar.jsx',
])

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : []
  })
}

const violations = walk(shared).flatMap((file) => {
  const name = relative(root, file).replaceAll('\\', '/')
  if (knownShellComposition.has(name)) return []
  const source = readFileSync(file, 'utf8')
  return [...source.matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g)]
    .filter(([, target]) => /(?:^|\/)features\//.test(target) || /^@\/features\//.test(target))
    .map(([, target]) => `${name}: ${target}`)
})

if (violations.length) {
  console.error('New shared -> feature dependencies:\n' + violations.join('\n'))
  process.exitCode = 1
} else {
  console.log('Shared dependency boundary: PASS (existing app-shell composition excepted)')
}
