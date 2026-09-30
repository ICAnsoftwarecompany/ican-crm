import { Briefcase, Repeat } from 'lucide-react'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { ASSIGNMENT_TYPES, ENROLLMENT_TRIGGERS, EXIT_CONDITIONS, SUBJECT_TYPES } from '../../follow-ups/constants/followUps'
import { FollowUpStepsField } from '../../follow-ups/components/FollowUpStepsField'
import { PortfoliosPanel } from '../../portfolios/components/PortfoliosPanel'
import { agentOptions } from './resourceHelpers'

const clean = (step) => Object.fromEntries(Object.entries(step).filter(([key]) => !key.startsWith('_draft_')))

/** Follow-up programs (spec §39): timed steps that turn into tasks for the owner; outcomes decide what happens next. */
export const followUpProgramsResource = {
  key: 'followUpPrograms',
  endpoint: serviceEndpoints.settings.followUpPrograms,
  icon: Repeat,
  i18nKey: 'service.settings.resources.followUpPrograms',
  titleField: 'name',
  dialogClassName: 'max-w-4xl',
  invalidates: [serviceKeys.followUps()],
  emptyValue: () => ({ name: { ar: '', en: '' }, subject_type: 'customer', enrollment_trigger: { type: 'manual', event: null }, steps: [], assignment: { type: 'owner', fallback_user_id: '' }, exit_conditions: [], status: 'active', trigger: 'manual', assignment_type: 'owner', fallback_user_id: '', active: true }),
  fromItem: (item) => ({ ...item, trigger: item.enrollment_trigger?.type === 'event' ? item.enrollment_trigger.event : 'manual', assignment_type: item.assignment?.type || 'owner', fallback_user_id: item.assignment?.fallback_user_id || '', active: item.status !== 'inactive' }),
  toPayload: ({ trigger, assignment_type: type, fallback_user_id: fallback, active, active_enrollments: _count, ...values }) => ({
    ...values,
    enrollment_trigger: !trigger || trigger === 'manual' ? { type: 'manual', event: null } : { type: 'event', event: trigger },
    assignment: { type: type || 'owner', fallback_user_id: fallback || null },
    steps: (values.steps || []).map(clean),
    status: active === false ? 'inactive' : 'active',
  }),
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'subject_type', type: 'select', row: 'a', labelKey: 'service.followUps.fields.subject', options: (ctx) => SUBJECT_TYPES.map((value) => ({ value, label: ctx.t(`service.followUps.subjects.${value}`) })) },
    { name: 'trigger', type: 'select', row: 'a', labelKey: 'service.followUps.fields.trigger', hintKey: 'service.followUps.fields.triggerHint', options: (ctx) => ENROLLMENT_TRIGGERS.map((value) => ({ value, label: ctx.t(`service.followUps.triggers.${value.replace('.', '_')}`) })) },
    { name: 'assignment_type', type: 'select', row: 'b', labelKey: 'service.followUps.fields.assignment', options: (ctx) => ASSIGNMENT_TYPES.map((value) => ({ value, label: ctx.t(`service.followUps.assignment.${value}`) })) },
    { name: 'fallback_user_id', type: 'select', row: 'b', labelKey: 'service.followUps.fields.fallbackUser', hintKey: 'service.followUps.fields.fallbackHint', options: agentOptions },
    { name: 'steps', type: 'custom', component: FollowUpStepsField, labelKey: 'service.followUps.fields.steps' },
    { name: 'exit_conditions', type: 'checkboxes', labelKey: 'service.followUps.fields.exitConditions', options: (ctx) => EXIT_CONDITIONS.map((value) => ({ value, label: ctx.t(`service.followUps.exitConditions.${value}`) })) },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) =>
    [
      ctx.t(`service.followUps.subjects.${item.subject_type}`),
      ctx.t('service.followUps.stepsCount', { count: item.steps?.length || 0 }),
      ctx.t('service.followUps.activeCount', { count: item.active_enrollments || 0 }),
      ctx.t('service.followUps.versionN', { n: item.version || 1 }),
    ].join(' · '),
}

export const portfoliosSection = { key: 'portfolios', icon: Briefcase, i18nKey: 'service.settings.resources.portfolios', component: PortfoliosPanel }
