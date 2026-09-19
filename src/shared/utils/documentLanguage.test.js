// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { resolveDocumentLanguageAttributes, syncDocumentLanguage } from './documentLanguage'

describe('resolveDocumentLanguageAttributes', () => {
  it('resolves an Arabic language code to rtl', () => {
    expect(resolveDocumentLanguageAttributes('ar')).toEqual({ lang: 'ar', dir: 'rtl' })
  })

  it('resolves an English language code to ltr', () => {
    expect(resolveDocumentLanguageAttributes('en')).toEqual({ lang: 'en', dir: 'ltr' })
  })

  it('resolves regional English variants (e.g. en-US) to ltr', () => {
    expect(resolveDocumentLanguageAttributes('en-US')).toEqual({ lang: 'en', dir: 'ltr' })
  })

  it('defaults to Arabic/rtl for an unrecognized or missing language', () => {
    expect(resolveDocumentLanguageAttributes(undefined)).toEqual({ lang: 'ar', dir: 'rtl' })
    expect(resolveDocumentLanguageAttributes('fr')).toEqual({ lang: 'ar', dir: 'rtl' })
  })
})

describe('syncDocumentLanguage', () => {
  it('applies lang/dir to document.documentElement', () => {
    syncDocumentLanguage('en')
    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')

    syncDocumentLanguage('ar')
    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
  })
})
