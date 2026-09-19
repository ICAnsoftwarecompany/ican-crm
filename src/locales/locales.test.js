import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { resources } from './index.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const flatten = (value, prefix = '') => Object.entries(value).flatMap(([key, item]) => {
  const keyPath = prefix ? `${prefix}.${key}` : key
  return item && typeof item === 'object' && !Array.isArray(item) ? flatten(item, keyPath) : [[keyPath, item]]
})

function moduleNames(language) {
  return readdirSync(path.join(dirname, language))
    .filter((file) => file.endsWith('.js') && file !== 'index.js')
    .map((file) => file.replace(/\.js$/, ''))
    .sort()
}

describe('modular locale resources', () => {
  it('assembles the Arabic translation resource', () => {
    expect(resources.ar.common).toBeTruthy()
    expect(typeof resources.ar.common).toBe('object')
  })

  it('assembles the English translation resource', () => {
    expect(resources.en.common).toBeTruthy()
    expect(typeof resources.en.common).toBe('object')
  })

  it('registers every locale module file on both languages', () => {
    const arModules = moduleNames('ar')
    const enModules = moduleNames('en')
    expect(arModules).toEqual(enModules)
    expect(Object.keys(resources.ar.common).sort()).toEqual(arModules)
    expect(Object.keys(resources.en.common).sort()).toEqual(enModules)
  })

  it('keeps nested keys intact through composition', () => {
    expect(resources.ar.common.customers?.title).toBeTruthy()
    expect(resources.en.common.customers?.title).toBeTruthy()
    expect(resources.ar.common.app?.network?.offline).toBeTruthy()
    expect(resources.en.common.app?.network?.offline).toBeTruthy()
  })

  it('has matching leaf-key sets for Arabic and English', () => {
    const arKeys = new Set(flatten(resources.ar.common).map(([key]) => key))
    const enKeys = new Set(flatten(resources.en.common).map(([key]) => key))
    const onlyAr = [...arKeys].filter((key) => !enKeys.has(key))
    const onlyEn = [...enKeys].filter((key) => !arKeys.has(key))
    expect(onlyAr).toEqual([])
    expect(onlyEn).toEqual([])
  })

  it('has no empty or non-string leaf values', () => {
    const invalid = [...flatten(resources.ar.common), ...flatten(resources.en.common)]
      .filter(([, value]) => typeof value !== 'string' || !value.trim())
    expect(invalid).toEqual([])
  })
})
