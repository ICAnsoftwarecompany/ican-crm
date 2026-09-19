import { readdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

const flatten = (value, prefix = '') => Object.entries(value).flatMap(([key, item]) => {
  const keyPath = prefix ? `${prefix}.${key}` : key
  return item && typeof item === 'object' && !Array.isArray(item) ? flatten(item, keyPath) : [[keyPath, item]]
})

async function loadLanguage(language) {
  const dir = path.join(repoRoot, 'src/locales', language)
  const moduleFiles = readdirSync(dir)
    .filter((file) => file.endsWith('.js') && file !== 'index.js')
    .map((file) => file.replace(/\.js$/, ''))
    .sort()

  const indexUrl = pathToFileURL(path.join(dir, 'index.js')).href
  const indexModule = (await import(indexUrl)).default
  const registeredKeys = Object.keys(indexModule).sort()

  const missingFromIndex = moduleFiles.filter((key) => !registeredKeys.includes(key))
  const extraInIndex = registeredKeys.filter((key) => !moduleFiles.includes(key))

  return {
    flat: new Map(flatten(indexModule)),
    moduleFiles,
    registeredKeys,
    missingFromIndex,
    extraInIndex,
  }
}

const ar = await loadLanguage('ar')
const en = await loadLanguage('en')

const onlyArabic = [...ar.flat.keys()].filter((key) => !en.flat.has(key))
const onlyEnglish = [...en.flat.keys()].filter((key) => !ar.flat.has(key))
const invalid = [...ar.flat.entries(), ...en.flat.entries()].filter(([, value]) => typeof value !== 'string' || !value.trim())

let failed = false

console.log(`Translation keys: ar=${ar.flat.size}, en=${en.flat.size}`)
console.log(`Locale modules: ar=${ar.moduleFiles.length}, en=${en.moduleFiles.length}`)

for (const [language, result] of [['ar', ar], ['en', en]]) {
  if (result.missingFromIndex.length) {
    failed = true
    console.error(`[${language}] Module file(s) not registered in index.js:`, result.missingFromIndex)
  }
  if (result.extraInIndex.length) {
    failed = true
    console.error(`[${language}] index.js references module(s) with no matching file:`, result.extraInIndex)
  }
}

if (onlyArabic.length || onlyEnglish.length || invalid.length) {
  failed = true
  console.error('Missing English keys:', onlyArabic)
  console.error('Missing Arabic keys:', onlyEnglish)
  console.error('Empty/non-string translations:', invalid.map(([key]) => key))
}

if (failed) {
  process.exitCode = 1
} else {
  console.log('Arabic/English key parity: PASS')
  console.log('Locale module registration: PASS')
}
