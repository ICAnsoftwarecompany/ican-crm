/**
 * Customer Hub capabilities in the ONE Workflow Engine of ICAN (spec §18: no separate engine for service). This file
 * only DESCRIBES triggers / conditions / actions / variables — the backend runs them. Every entry is
 * `backendSupport: false` until the service events and actions ship on the server (spec §6 events, §18.2 actions).
 * Rule from spec §45.1: AI signals (sentiment, health band) are conditions; the workflow decides.
 */
import { registerDataSource, registerWorkflowModule } from '../../workflow-engine/registry/workflowRegistry'

const K = 'service.workflow'
const fixed = (key, values, prefix) => registerDataSource(key, { labelKey: `${K}.sources.${key}`, options: values.map((value) => ({ value, labelKey: `${prefix}.${value}` })) })

fixed('service_priorities', ['low', 'normal', 'high', 'urgent'], 'service.cases.priority')
fixed('service_sentiments', ['negative', 'neutral', 'positive'], 'service.ai.sentiment')
fixed('service_health_bands', ['healthy', 'watch', 'at_risk'], 'service.health.bands')
fixed('service_survey_types', ['csat', 'nps', 'ces'], 'service.feedback.types')
fixed('service_channels', ['whatsapp', 'messenger', 'email', 'phone', 'portal', 'internal'], 'service.cases.channels')

const trigger = (id, icon, fields = []) => ({ id, type: 'trigger', module: 'customer_service', category: id.split('.')[0], labelKey: `${K}.triggers.${id.replace(/\./g, '_')}`, icon, eventName: `service.${id}`, fields, backendSupport: false })
const condition = (id, icon, fields) => ({ id, type: 'condition', module: 'customer_service', labelKey: `${K}.conditions.${id.replace(/\./g, '_')}`, icon, fields, backendSupport: false })
const action = (id, icon, fields) => ({ id, type: 'action', module: 'customer_service', labelKey: `${K}.actions.${id.replace(/\./g, '_')}`, icon, fields, backendSupport: false })
const field = (key, type, extra = {}) => ({ key, type, labelKey: `${K}.fields.${key}`, ...extra })

registerWorkflowModule({
  module: 'customer_service',
  labelKey: `${K}.module`,
  icon: 'Headset',
  triggers: [
    trigger('case.created', 'Inbox'),
    trigger('case.status_changed', 'RefreshCw'),
    trigger('case.sla_at_risk', 'Timer'),
    trigger('case.sla_breached', 'AlarmClock'),
    trigger('case.resolved', 'CheckCircle2'),
    trigger('feedback.low_score', 'ThumbsDown', [field('survey_type', 'select', { source: 'service_survey_types' })]),
    trigger('follow_up.outcome_recorded', 'Repeat'),
    trigger('record.status_changed', 'Layers'),
    trigger('subscription.renewal_window', 'CalendarClock', [field('days_before', 'number')]),
    trigger('health.band_changed', 'HeartPulse', [field('band', 'select', { source: 'service_health_bands' })]),
    trigger('portal.request_created', 'Globe'),
  ],
  conditions: [
    condition('case.priority', 'Flag', [field('value', 'select', { source: 'service_priorities' })]),
    condition('case.channel', 'MessageCircle', [field('value', 'select', { source: 'service_channels' })]),
    condition('case.type_key', 'Tag', [field('value', 'text')]),
    condition('ai.sentiment', 'Sparkles', [field('value', 'select', { source: 'service_sentiments' })]),
    condition('customer.health_band', 'HeartPulse', [field('value', 'select', { source: 'service_health_bands' })]),
  ],
  actions: [
    action('case.create', 'PlusCircle', [field('case_type_key', 'text', { required: true }), field('subject', 'variable_text', { required: true }), field('priority', 'select', { source: 'service_priorities' })]),
    action('case.set_priority', 'Flag', [field('priority', 'select', { source: 'service_priorities', required: true })]),
    action('case.assign', 'UserCheck', [field('user_id', 'user', { source: 'users', required: true })]),
    action('case.add_note', 'StickyNote', [field('body', 'variable_text', { required: true })]),
    action('case.reply', 'Send', [field('body', 'variable_text', { required: true })]),
    action('follow_up.enroll', 'Repeat', [field('program_id', 'text', { required: true })]),
    action('quality.queue_review', 'ClipboardCheck', []),
    action('portal.send_update', 'Globe', [field('body', 'variable_text', { required: true })]),
  ],
  variables: [
    { key: 'case.number', labelKey: `${K}.variables.caseNumber` },
    { key: 'case.subject', labelKey: `${K}.variables.caseSubject` },
    { key: 'case.status', labelKey: `${K}.variables.caseStatus` },
    { key: 'customer.name', labelKey: `${K}.variables.customerName` },
    { key: 'customer.phone', labelKey: `${K}.variables.customerPhone` },
    { key: 'feedback.score', labelKey: `${K}.variables.feedbackScore` },
  ],
})
