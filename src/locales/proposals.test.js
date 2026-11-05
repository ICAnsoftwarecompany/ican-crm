import { describe, expect, it } from 'vitest'
import ar from './ar/index.js'
import en from './en/index.js'

const paths = [
  'page.pageTitle', 'page.pageDescription', 'page.newProposal', 'page.templates',
  'page.searchPlaceholder', 'page.allUsers', 'page.resetFilters',
  'page.columnProposal', 'page.columnActions', 'page.noProposalsYet',
  'page.noProposalsHint', 'wizard.steps.customer', 'wizard.steps.template',
  'wizard.steps.review', 'pricing.totalLabel', 'templates.pageTitle',
  'builder.fields.title', 'builder.header.saveNow',
]

function atPath(root, path) {
  return path.split('.').reduce((value, key) => value?.[key], root)
}

describe('proposal translations', () => {
  for (const [language, resources] of [['ar', ar], ['en', en]]) {
    it(`resolves proposal page and builder keys in ${language}`, () => {
      for (const path of paths) {
        const value = atPath(resources.proposals, path)
        expect(value, `proposals.${path}`).toEqual(expect.any(String))
        expect(value.trim().length).toBeGreaterThan(0)
      }
    })
  }
})
