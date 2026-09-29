import { BookMarked, MessageSquareText, Zap } from 'lucide-react'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { labelOptions, listOf, listText, namesOf, priorityOptions, statusOptions } from './resourceHelpers'

const { settings } = serviceEndpoints
const L = () => ({ ar: '', en: '' })
const hasText = (value) => Boolean(value && (String(value.ar || '').trim() || String(value.en || '').trim()))
const CHANNELS = ['whatsapp', 'messenger', 'email', 'phone', 'portal', 'internal']
const VARIABLES = '{{customer.name}} · {{case.number}} · {{agent.name}}'

export const savedRepliesResource = {
  key: 'savedReplies',
  endpoint: settings.savedReplies,
  icon: MessageSquareText,
  i18nKey: 'service.settings.resources.savedReplies',
  titleField: 'title',
  dependsOn: ['caseTypes'],
  emptyValue: () => ({ title: L(), body: L(), case_type_ids: [], channels: [], owner_type: 'tenant', active: true }),
  fields: [
    { name: 'title', type: 'localized', labelKey: 'service.settings.fields.title' },
    { name: 'body', type: 'localizedTextarea', labelKey: 'service.settings.fields.body', hintKey: 'service.settings.fields.variablesHint', hintValues: { variables: VARIABLES } },
    { name: 'case_type_ids', type: 'checkboxes', labelKey: 'service.settings.fields.appliesToTypes', hintKey: 'service.settings.fields.emptyMeansAll', options: (ctx) => labelOptions(listOf(ctx, 'caseTypes'), ctx.language) },
    { name: 'channels', type: 'checkboxes', labelKey: 'service.settings.fields.channels', hintKey: 'service.settings.fields.emptyMeansAll', options: (ctx) => CHANNELS.map((value) => ({ value, label: ctx.t(`service.cases.channels.${value}`) })) },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) =>
    listText(namesOf(item.case_type_ids, labelOptions(listOf(ctx, 'caseTypes'), ctx.language)), ctx.language) || ctx.t('service.settings.allTypes'),
}

/**
 * Macros are stored as ordered `actions` (spec §40.2); the form edits a flat
 * version and converts back with `toPayload`.
 */
export const macrosResource = {
  key: 'macros',
  endpoint: settings.macros,
  icon: Zap,
  i18nKey: 'service.settings.resources.macros',
  titleField: 'name',
  emptyValue: () => ({ name: L(), description: L(), reply: L(), set_status_id: '', set_priority: '', note: L(), active: true }),
  fromItem: (item) => {
    const find = (type) => item.actions?.find((action) => action.type === type)
    return {
      ...item,
      reply: find('reply')?.body || L(),
      set_status_id: find('set_status')?.status_id || '',
      set_priority: find('set_priority')?.priority || '',
      note: find('add_note')?.body || L(),
    }
  },
  toPayload: ({ reply, set_status_id: statusId, set_priority: priority, note, ...rest }) => ({
    ...rest,
    actions: [
      hasText(reply) && { type: 'reply', body: reply },
      statusId && { type: 'set_status', status_id: statusId },
      priority && { type: 'set_priority', priority },
      hasText(note) && { type: 'add_note', body: note },
    ].filter(Boolean),
  }),
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'description', type: 'localized', labelKey: 'service.settings.fields.description' },
    { name: 'reply', type: 'localizedTextarea', labelKey: 'service.settings.macro.reply', hintKey: 'service.settings.fields.variablesHint', hintValues: { variables: VARIABLES } },
    { name: 'set_status_id', type: 'select', labelKey: 'service.settings.macro.setStatus', placeholderKey: 'service.settings.macro.noChange', row: 'set', options: statusOptions },
    { name: 'set_priority', type: 'select', labelKey: 'service.settings.macro.setPriority', placeholderKey: 'service.settings.macro.noChange', row: 'set', options: priorityOptions },
    { name: 'note', type: 'localizedTextarea', labelKey: 'service.settings.macro.note' },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) =>
    listText((item.actions || []).map((action) => ctx.t(`service.settings.macro.actions.${action.type}`)), ctx.language),
}

export const kbCategoriesResource = {
  key: 'kbCategories',
  endpoint: settings.kbCategories,
  icon: BookMarked,
  i18nKey: 'service.settings.resources.kbCategories',
  invalidates: [serviceKeys.kb()],
  emptyValue: () => ({ label: L(), visibility: 'agent' }),
  fields: [
    { name: 'label', type: 'localized', labelKey: 'service.settings.fields.name' },
    {
      name: 'visibility',
      type: 'select',
      labelKey: 'service.settings.fields.visibility',
      options: (ctx) => ['internal', 'agent', 'customer', 'public'].map((value) => ({ value, label: ctx.t(`service.knowledge.visibility.${value}`) })),
    },
  ],
  summary: (item, ctx) => ctx.t(`service.knowledge.visibility.${item.visibility}`, { defaultValue: '' }),
}
