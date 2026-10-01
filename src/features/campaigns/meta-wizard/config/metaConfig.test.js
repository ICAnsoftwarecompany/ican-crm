import { describe, expect, it } from 'vitest'
import { getAdSetOptionsForObjective, getAdSetRequirements, isAdSetCompatibleWithObjective } from './metaAdSetCompatibility'
import { META_CAMPAIGN_OBJECTIVES } from './metaObjectives'
import { CAMPAIGN_PRESETS } from './campaignPresets'
import { getCallToActions } from './metaCallToActions'
import { normalizeSpecialAdCategories } from './metaSpecialAdCategories'
import { getCurrencyOffset, toMinorCurrencyUnit } from '../utils/campaignMoney'

describe('Meta conversion matrix', () => {
  it('offers at least one destination with a default goal for every objective', () => {
    for (const objective of META_CAMPAIGN_OBJECTIVES) {
      const { locations } = getAdSetOptionsForObjective(objective)
      expect(locations.length).toBeGreaterThan(0)
      for (const location of locations) expect(getAdSetOptionsForObjective(objective, location).defaultGoal).not.toBe('')
    }
  })

  it('uses landing-page views as the default for website traffic', () => {
    expect(getAdSetOptionsForObjective('OUTCOME_TRAFFIC', 'website').defaultGoal).toBe('LANDING_PAGE_VIEWS')
  })

  it('makes the awareness destination automatic', () => {
    expect(getAdSetOptionsForObjective('OUTCOME_AWARENESS')).toMatchObject({ locationIsAutomatic: true, defaultLocation: 'default' })
  })

  it('rejects a goal from another objective', () => {
    expect(isAdSetCompatibleWithObjective('OUTCOME_AWARENESS', { conversionLocation: 'default', performanceGoal: 'OFFSITE_CONVERSIONS' })).toBe(false)
  })

  it('requires a Pixel only when optimizing a website for conversions', () => {
    expect(getAdSetRequirements('OUTCOME_LEADS', { conversionLocation: 'website', performanceGoal: 'OFFSITE_CONVERSIONS' }).has('pixel')).toBe(true)
    expect(getAdSetRequirements('OUTCOME_TRAFFIC', { conversionLocation: 'website', performanceGoal: 'LANDING_PAGE_VIEWS' }).has('pixel')).toBe(false)
  })

  it('asks for a lead form, WhatsApp number and phone where Meta needs them', () => {
    expect(getAdSetRequirements('OUTCOME_LEADS', { conversionLocation: 'instant_form' }).has('leadForm')).toBe(true)
    expect(getAdSetRequirements('OUTCOME_ENGAGEMENT', { conversionLocation: 'whatsapp' }).has('whatsapp')).toBe(true)
    expect(getAdSetRequirements('OUTCOME_LEADS', { conversionLocation: 'phone_call' }).has('phone')).toBe(true)
  })

  it('only ships presets that are valid combinations', () => {
    for (const preset of CAMPAIGN_PRESETS) {
      expect(isAdSetCompatibleWithObjective(preset.objective, preset)).toBe(true)
    }
  })

  it('has a call-to-action for every destination', () => {
    for (const objective of META_CAMPAIGN_OBJECTIVES) {
      for (const location of getAdSetOptionsForObjective(objective).locations) expect(getCallToActions(location).length).toBeGreaterThan(0)
    }
  })

  it('migrates the retired CREDIT category', () => {
    expect(normalizeSpecialAdCategories(['CREDIT', 'HOUSING', 'NONE'])).toEqual(['FINANCIAL_PRODUCTS_SERVICES', 'HOUSING'])
  })
})

describe('campaign money', () => {
  it('converts to the minor unit of the account currency', () => {
    expect(toMinorCurrencyUnit('50.25', 'EGP')).toBe(5025)
    expect(toMinorCurrencyUnit(1000, 'JPY')).toBe(1000)
    expect(getCurrencyOffset('usd')).toBe(100)
  })

  it('returns undefined for empty or invalid values', () => {
    expect(toMinorCurrencyUnit('', 'EGP')).toBeUndefined()
    expect(toMinorCurrencyUnit('abc', 'EGP')).toBeUndefined()
  })
})
