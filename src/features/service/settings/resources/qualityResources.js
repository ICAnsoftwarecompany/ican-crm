import { ClipboardCheck, MessageSquareHeart, Shuffle } from 'lucide-react'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { CriteriaField } from '../../quality/components/CriteriaField'
import { REVIEW_SUBJECTS, SURVEY_CHANNELS, SURVEY_EVENTS, SURVEY_TYPES } from '../../quality/constants/quality'
import { labelOptions, listOf } from './resourceHelpers'

const L = () => ({ ar: '', en: '' })
const activeFrom = (item) => ({ ...item, active: item.active !== false })

/** Quality checklists (spec §42.2): weighted criteria and the pass mark. */
export const qualityChecklistsResource = {
  key: 'qualityChecklists',
  endpoint: serviceEndpoints.quality.checklists,
  icon: ClipboardCheck,
  i18nKey: 'service.settings.resources.qualityChecklists',
  titleField: 'name',
  dialogClassName: 'max-w-3xl',
  invalidates: [serviceKeys.quality()],
  emptyValue: () => ({ name: L(), subject_type: 'case', criteria: [{ key: 'communication', label: L(), weight: 50 }, { key: 'resolution', label: L(), weight: 50 }], pass_score: 75, active: true }),
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'subject_type', type: 'select', row: 'a', labelKey: 'service.quality.fields.subject', options: (ctx) => REVIEW_SUBJECTS.map((value) => ({ value, label: ctx.t(`service.quality.subjects.${value}`) })) },
    { name: 'pass_score', type: 'number', row: 'a', labelKey: 'service.quality.fields.passScore' },
    { name: 'criteria', type: 'custom', component: CriteriaField, labelKey: 'service.quality.fields.criteria' },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) => [ctx.t(`service.quality.subjects.${item.subject_type}`), ctx.t('service.quality.criteriaCount', { count: item.criteria?.length || 0 }), ctx.t('service.quality.passMark', { value: item.pass_score })].join(' · '),
}

/** Sampling rules: which closed requests go to the review queue. */
export const samplingRulesResource = {
  key: 'samplingRules',
  endpoint: serviceEndpoints.quality.samplingRules,
  icon: Shuffle,
  i18nKey: 'service.settings.resources.samplingRules',
  titleField: 'name',
  dependsOn: ['qualityChecklists'],
  invalidates: [serviceKeys.quality()],
  emptyValue: () => ({ name: L(), checklist_id: '', percent: 10, min_per_agent: 1, only_low_csat: false, case_type_ids: [], active: true }),
  fromItem: activeFrom,
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'checklist_id', type: 'select', labelKey: 'service.quality.fields.checklist', options: (ctx) => labelOptions(listOf(ctx, 'qualityChecklists'), ctx.language, 'name') },
    { name: 'percent', type: 'number', row: 'a', labelKey: 'service.quality.fields.percent' },
    { name: 'min_per_agent', type: 'number', row: 'a', labelKey: 'service.quality.fields.minPerAgent' },
    { name: 'case_type_ids', type: 'checkboxes', labelKey: 'service.quality.fields.caseTypes', hintKey: 'service.settings.fields.emptyMeansAll', options: (ctx) => labelOptions(ctx.setup?.case_types || [], ctx.language) },
    { name: 'only_low_csat', type: 'switch', labelKey: 'service.quality.fields.onlyLowCsat' },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) => (item.only_low_csat ? ctx.t('service.quality.everyLowCsat') : ctx.t('service.quality.samplePercent', { value: item.percent, min: item.min_per_agent || 0 })),
}

/** Surveys (spec §42.1): CSAT / NPS / CES — when they are sent, where, and what a low score triggers. */
export const surveysResource = {
  key: 'surveys',
  endpoint: serviceEndpoints.feedbackSurveys,
  icon: MessageSquareHeart,
  i18nKey: 'service.settings.resources.surveys',
  titleField: 'name',
  dialogClassName: 'max-w-2xl',
  invalidates: [[...serviceKeys.all, 'feedback']],
  emptyValue: () => ({ name: L(), type: 'csat', event: 'case.resolved', delay_hours: 1, channel: 'whatsapp', question: L(), low_case: false, case_type_key: '', active: true }),
  fromItem: (item) => ({ ...item, event: item.trigger?.event || 'case.resolved', delay_hours: item.trigger?.delay_hours ?? item.trigger?.every_days ?? 0, low_case: item.low_score_action?.type === 'create_case', case_type_key: item.low_score_action?.case_type_key || '', active: item.active !== false }),
  toPayload: ({ event, delay_hours: delay, low_case: lowCase, case_type_key: caseTypeKey, ...values }) => ({
    ...values,
    trigger: event === 'periodic' ? { event, every_days: Number(delay) || 90 } : { event, delay_hours: Number(delay) || 0 },
    low_score_action: lowCase ? { type: 'create_case', case_type_key: caseTypeKey || null } : { type: 'none' },
  }),
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'type', type: 'select', row: 'a', labelKey: 'service.quality.fields.surveyType', options: (ctx) => SURVEY_TYPES.map((value) => ({ value, label: ctx.t(`service.feedback.types.${value}`) })) },
    { name: 'channel', type: 'select', row: 'a', labelKey: 'service.quality.fields.channel', options: (ctx) => SURVEY_CHANNELS.map((value) => ({ value, label: ctx.t(`service.quality.channels.${value}`) })) },
    { name: 'event', type: 'select', row: 'b', labelKey: 'service.quality.fields.when', options: (ctx) => SURVEY_EVENTS.map((value) => ({ value, label: ctx.t(`service.quality.events.${value.replace('.', '_')}`) })) },
    { name: 'delay_hours', type: 'number', row: 'b', labelKey: 'service.quality.fields.delay', hintKey: 'service.quality.fields.delayHint' },
    { name: 'question', type: 'localized', labelKey: 'service.quality.fields.question' },
    { name: 'low_case', type: 'switch', labelKey: 'service.quality.fields.lowScoreCase' },
    { name: 'case_type_key', type: 'select', labelKey: 'service.quality.fields.caseType', hiddenWhen: (values) => !values.low_case, options: (ctx) => (ctx.setup?.case_types || []).map((type) => ({ value: type.key, label: labelOptions([type], ctx.language)[0].label })) },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) => [ctx.t(`service.feedback.types.${item.type}`), ctx.t(`service.quality.channels.${item.channel}`), ctx.t(`service.quality.events.${(item.trigger?.event || '').replace('.', '_')}`), item.low_score_action?.type === 'create_case' && ctx.t('service.quality.lowOpensCase')].filter(Boolean).join(' · '),
}
