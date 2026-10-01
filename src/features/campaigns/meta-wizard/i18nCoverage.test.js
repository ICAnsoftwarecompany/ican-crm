import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import en from '../../../locales/en/campaignWizard.js'
import ar from '../../../locales/ar/campaignWizard.js'
import { META_CAMPAIGN_OBJECTIVES } from './config/metaObjectives.js'
import { CAMPAIGN_PRESETS } from './config/campaignPresets.js'
import { CONVERSION_LOCATIONS, getAdSetOptionsForObjective } from './config/metaAdSetCompatibility.js'
import { getCallToActions, AD_FORMATS } from './config/metaCallToActions.js'
import { PLACEMENT_PLATFORMS, DEVICE_PLATFORMS } from './config/metaPlacements.js'
import { SPECIAL_AD_CATEGORIES } from './config/metaSpecialAdCategories.js'
import { META_CONVERSION_EVENTS } from './config/metaConversionEvents.js'
import { LOCATION_TYPES } from './domain/geoTargeting.js'
import { STAGES } from './state/wizardStages.js'

const get = (obj, path) => path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), obj)
const root = dirname(fileURLToPath(import.meta.url))
const walk = (dir) => readdirSync(dir).flatMap((name) => { const p = join(dir, name); return statSync(p).isDirectory() ? walk(p) : /\.jsx?$/.test(name) && !/test/.test(name) ? [p] : [] })

// Every translation key the wizard can request at runtime — static keys in the
// source plus keys built from the config enums — must exist in ar and en.
describe('campaignWizard translations', () => {
it('covers every key the wizard can request', () => {
  const keys = new Set()
  for (const file of walk(root)) for (const m of readFileSync(file, 'utf8').matchAll(/'campaignWizard\.([A-Za-z0-9_.]+)'/g)) keys.add(m[1])
  const add = (k) => keys.add(k)
  for (const s of STAGES) ['title', 'short', 'intro', 'guide'].forEach((k) => add(`stages.${s}.${k}`))
  for (const o of META_CAMPAIGN_OBJECTIVES) { add(`objectives.${o}.title`); add(`objectives.${o}.description`); add(`guide.fields.objectives.${o}.title`)
    for (const loc of getAdSetOptionsForObjective(o).locations) { ['title', 'description', 'adHint'].forEach((k) => add(`locations.${loc}.${k}`)); for (const g of getAdSetOptionsForObjective(o, loc).goals) { add(`goals.${g}.title`); add(`goals.${g}.description`) } for (const c of getCallToActions(loc)) add(`ctas.${c}`) } }
  Object.keys(CONVERSION_LOCATIONS).forEach((loc) => ['title', 'description', 'adHint'].forEach((k) => add(`locations.${loc}.${k}`)))
  CAMPAIGN_PRESETS.forEach((p) => { add(`presets.${p.id}.title`); add(`presets.${p.id}.description`) })
  AD_FORMATS.forEach((f) => { add(`ads.formats.${f}.title`); add(`ads.formats.${f}.description`); add(`guide.fields.ad.formats.${f}.title`) })
  Object.entries(PLACEMENT_PLATFORMS).forEach(([p, c]) => { add(`placements.platforms.${p}`); c.positions.forEach((pos) => add(`placements.positions.${p}.${pos}`)) })
  DEVICE_PLATFORMS.forEach((d) => add(`placements.deviceTypes.${d}`))
  SPECIAL_AD_CATEGORIES.forEach((c) => add(`specialCategories.${c}.title`))
  META_CONVERSION_EVENTS.forEach((e) => add(`events.${e}`))
  LOCATION_TYPES.forEach((t) => { add(`geo.locationTypes.${t}.title`); add(`geo.locationTypes.${t}.hint`) })
  ;['country', 'region', 'city', 'neighborhood', 'zip', 'custom_location'].forEach((t) => add(`geo.types.${t}`))
  ;['highest_volume', 'cost_cap', 'bid_cap', 'highest_value', 'minimum_roas'].forEach((s) => { add(`budget.strategies.${s}.title`); add(`budget.strategies.${s}.hint`) })
  ;['cost_cap', 'bid_cap', 'minimum_roas'].forEach((s) => add(`budget.strategies.${s}.amountLabel`))
  ;['daily', 'lifetime'].forEach((b) => { add(`budget.${b}`); add(`budget.${b}Hint`) })
  for (let d = 0; d < 7; d += 1) add(`schedule.days.${d}`)
  ;['running', 'partial', 'failed', 'done'].forEach((s) => { add(`publish.status.${s}`); add(`publish.dialogTitle.${s}`) })
  ;['missingCampaignId', 'missingAdSetId', 'missingAdId'].forEach((e) => add(`publish.errors.${e}`))
  ;['PAUSED', 'ACTIVE'].forEach((s) => { add(`review.publishStatus.${s}.title`); add(`review.publishStatus.${s}.description`) })
  ;['unsaved', 'failed', 'new'].forEach((s) => add(`header.saveStatus.${s}`))
  ;['leadForm', 'phone', 'websiteUrl'].forEach((k) => add(`adSets.adLevelItems.${k}`))
  ;['campaign', 'adSet'].forEach((l) => { add(`campaignSetup.budgetLevels.${l}.title`); add(`campaignSetup.budgetLevels.${l}.description`) })
  ;['advantage', 'manual'].forEach((m) => { add(`placements.${m}.title`); add(`placements.${m}.description`) })
  ;['all', 'male', 'female'].forEach((g) => add(`audience.genders.${g}`))
  ;['none', 'narrow', 'good', 'broad'].forEach((l) => add(`audience.reachLevels.${l}`))
  ;['interests', 'behaviors'].forEach((l) => add(`audience.targetingTypes.${l}`))
  ;['more_volume', 'higher_intent'].forEach((l) => { add(`leadForm.types.${l}.title`); add(`leadForm.types.${l}.description`) })
  ;['FULL_NAME', 'PHONE', 'EMAIL', 'CITY', 'STATE', 'JOB_TITLE', 'COMPANY_NAME', 'DATE_OF_BIRTH', 'GENDER'].forEach((q) => add(`leadForm.questionTypes.${q}`))
  ;['VIEW_WEBSITE', 'CALL_BUSINESS', 'DOWNLOAD', 'NONE'].forEach((b) => add(`leadForm.thankYouButtons.${b}`))
  // issue codes emitted by the validator
  const validator = readFileSync(join(root, 'domain/validateWizard.js'), 'utf8')
  for (const m of validator.matchAll(/code: '([A-Za-z]+)'/g)) add(`issues.${m[1]}`)
  for (const m of validator.matchAll(/push\('[^']+', '([A-Za-z]+)'/g)) add(`issues.${m[1]}`)
  ;['geoNoLocation', 'geoIncludedAndExcluded', 'geoExclusionOutside', 'geoRedundant', 'geoRadiusOutOfRange'].forEach((c) => add(`issues.${c}`))
  // guide keys passed as guideKey="..."
  for (const file of walk(root)) for (const m of readFileSync(file, 'utf8').matchAll(/guideKey[=:]\s*["'`]([A-Za-z_.]+)["'`]/g)) add(`guide.fields.${m[1]}.title`)
  const missing = [...keys].filter((k) => typeof get(en, k) !== 'string' || typeof get(ar, k) !== 'string')
  expect(missing).toEqual([])
})
})
