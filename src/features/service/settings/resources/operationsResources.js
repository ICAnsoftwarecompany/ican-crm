import { CalendarClock, Clock, Layers, ShieldAlert, Tags } from 'lucide-react'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { CASE_TYPE_ICONS } from '../../cases/components/CaseTypeIcon'
import { EscalationTriggersField, HolidaysField, WorkingHoursField } from '../components/fields/CompositeFields'
import { agentOptions, formatMinutes, labelOptions, listOf, listText, namesOf, priorityOptions } from './resourceHelpers'

const { settings } = serviceEndpoints
const L = () => ({ ar: '', en: '' })
const WEEK = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']

/**
 * Settings resource definition:
 * { key, endpoint, icon, i18nKey (title/one/description), titleField, fields[], emptyValue(),
 *   summary(item, ctx), dependsOn[] (lists needed for options), invalidates[] (query keys) }
 */
export const caseTypesResource = {
  key: 'caseTypes',
  endpoint: settings.caseTypes,
  icon: Tags,
  i18nKey: 'service.settings.resources.caseTypes',
  dependsOn: ['queues', 'slaPolicies', 'pipelines'],
  invalidates: [serviceKeys.caseSetup(), serviceKeys.cases()],
  emptyValue: () => ({ key: '', label: L(), icon: 'HelpCircle', pipeline_id: null, default_priority: 'normal', default_queue_id: null, sla_policy_id: null, active: true }),
  fields: [
    { name: 'label', type: 'localized', labelKey: 'service.settings.fields.label' },
    { name: 'key', type: 'text', ltr: true, labelKey: 'service.settings.fields.key', hintKey: 'service.settings.fields.keyHint', row: 'a' },
    { name: 'icon', type: 'select', labelKey: 'service.settings.fields.icon', row: 'a', options: () => Object.keys(CASE_TYPE_ICONS).map((name) => ({ value: name, label: name })) },
    { name: 'pipeline_id', type: 'select', labelKey: 'service.catalog.pipeline', hintKey: 'service.catalog.pipelineHint', options: (ctx) => labelOptions(listOf(ctx, 'pipelines').filter((pipeline) => pipeline.entity === 'case'), ctx.language) },
    { name: 'default_priority', type: 'select', labelKey: 'service.cases.fields.priority', row: 'b', options: priorityOptions },
    { name: 'default_queue_id', type: 'select', labelKey: 'service.settings.fields.defaultQueue', row: 'b', options: (ctx) => labelOptions(listOf(ctx, 'queues'), ctx.language) },
    { name: 'sla_policy_id', type: 'select', labelKey: 'service.settings.fields.slaPolicy', placeholderKey: 'service.settings.fields.slaAuto', options: (ctx) => labelOptions(listOf(ctx, 'slaPolicies'), ctx.language, 'name') },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) =>
    [item.key, ctx.t(`service.cases.priority.${item.default_priority}`, { defaultValue: '' })].filter(Boolean).join(' · '),
}

export const queuesResource = {
  key: 'queues',
  endpoint: settings.queues,
  icon: Layers,
  i18nKey: 'service.settings.resources.queues',
  invalidates: [serviceKeys.caseSetup(), serviceKeys.cases()],
  emptyValue: () => ({ key: '', label: L(), assignment_strategy: 'round_robin', agent_ids: [] }),
  fields: [
    { name: 'label', type: 'localized', labelKey: 'service.settings.fields.label' },
    { name: 'key', type: 'text', ltr: true, labelKey: 'service.settings.fields.key', row: 'a' },
    {
      name: 'assignment_strategy',
      type: 'select',
      labelKey: 'service.settings.fields.assignmentStrategy',
      row: 'a',
      options: (ctx) => ['manual', 'round_robin', 'least_loaded'].map((value) => ({ value, label: ctx.t(`service.settings.strategies.${value}`) })),
    },
    { name: 'agent_ids', type: 'checkboxes', labelKey: 'service.settings.fields.agents', options: agentOptions },
  ],
  summary: (item, ctx) =>
    [ctx.t(`service.settings.strategies.${item.assignment_strategy}`, { defaultValue: '' }), ctx.t('service.settings.agentsCount', { count: item.agent_ids?.length || 0 })]
      .filter(Boolean)
      .join(' · '),
}

export const businessCalendarsResource = {
  key: 'businessCalendars',
  endpoint: settings.businessCalendars,
  icon: CalendarClock,
  i18nKey: 'service.settings.resources.businessCalendars',
  titleField: 'name',
  emptyValue: () => ({
    name: L(),
    timezone: 'Africa/Cairo',
    working_hours: WEEK.map((day) => ({ day, enabled: day !== 'friday', start: '09:00', end: '17:00' })),
    holidays: [],
  }),
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'timezone', type: 'text', ltr: true, labelKey: 'service.settings.fields.timezone' },
    { name: 'working_hours', type: 'custom', component: WorkingHoursField, labelKey: 'service.settings.fields.workingHours' },
    { name: 'holidays', type: 'custom', component: HolidaysField, labelKey: 'service.settings.fields.holidays' },
  ],
  summary: (item, ctx) => {
    const days = (item.working_hours || []).filter((row) => row.enabled).map((row) => ctx.t(`service.settings.daysShort.${row.day}`))
    return [item.timezone, days.join(' '), ctx.t('service.settings.holidaysCount', { count: item.holidays?.length || 0 })].join(' · ')
  },
}

export const slaPoliciesResource = {
  key: 'slaPolicies',
  endpoint: settings.slaPolicies,
  icon: Clock,
  i18nKey: 'service.settings.resources.slaPolicies',
  titleField: 'name',
  dependsOn: ['businessCalendars', 'caseTypes'],
  invalidates: [serviceKeys.cases()],
  emptyValue: () => ({
    name: L(),
    order: 10,
    priorities: [],
    case_type_ids: [],
    first_response_minutes: 60,
    resolution_minutes: 480,
    business_calendar_id: null,
    pause_on_pending_customer: true,
    active: true,
  }),
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'first_response_minutes', type: 'duration', labelKey: 'service.settings.fields.firstResponse', row: 'targets' },
    { name: 'resolution_minutes', type: 'duration', labelKey: 'service.settings.fields.resolution', row: 'targets' },
    { name: 'priorities', type: 'checkboxes', labelKey: 'service.settings.fields.appliesToPriorities', hintKey: 'service.settings.fields.emptyMeansAll', options: priorityOptions },
    { name: 'case_type_ids', type: 'checkboxes', labelKey: 'service.settings.fields.appliesToTypes', hintKey: 'service.settings.fields.emptyMeansAll', options: (ctx) => labelOptions(listOf(ctx, 'caseTypes'), ctx.language) },
    { name: 'business_calendar_id', type: 'select', labelKey: 'service.settings.fields.businessCalendar', row: 'c', options: (ctx) => labelOptions(listOf(ctx, 'businessCalendars'), ctx.language, 'name') },
    { name: 'order', type: 'number', labelKey: 'service.settings.fields.order', hintKey: 'service.settings.fields.orderHint', row: 'c' },
    { name: 'pause_on_pending_customer', type: 'switch', labelKey: 'service.settings.fields.pauseOnPending', hintKey: 'service.settings.fields.pauseOnPendingHint' },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) =>
    [
      ctx.t('service.settings.slaTargets', { first: formatMinutes(item.first_response_minutes, ctx.t), resolution: formatMinutes(item.resolution_minutes, ctx.t) }),
      listText(namesOf(item.priorities, priorityOptions(ctx)), ctx.language) || ctx.t('service.settings.allPriorities'),
    ].join(' · '),
}

export const escalationRulesResource = {
  key: 'escalationRules',
  endpoint: settings.escalationRules,
  icon: ShieldAlert,
  i18nKey: 'service.settings.resources.escalationRules',
  titleField: 'name',
  emptyValue: () => ({ name: L(), priorities: [], triggers: [{ at: 80, action: 'notify', target: 'assignee' }], active: true }),
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'priorities', type: 'checkboxes', labelKey: 'service.settings.fields.appliesToPriorities', hintKey: 'service.settings.fields.emptyMeansAll', options: priorityOptions },
    { name: 'triggers', type: 'custom', component: EscalationTriggersField, labelKey: 'service.settings.fields.triggers' },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) =>
    (item.triggers || [])
      .map((trigger) => ctx.t('service.settings.escalation.summary', {
        at: trigger.at,
        action: ctx.t(`service.settings.escalation.actions.${trigger.action}`),
        target: ctx.t(`service.settings.escalation.targets.${trigger.target}`),
      }))
      .join(' · '),
}
