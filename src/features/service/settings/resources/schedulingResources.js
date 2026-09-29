import { Wrench } from 'lucide-react'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { labelOptions, listOf, listText } from './resourceHelpers'

export const RESOURCE_TYPES = ['technician', 'courier', 'guide', 'room', 'vehicle', 'seats', 'unit']
const L = () => ({ ar: '', en: '' })
export const splitTags = (text) => String(text || '').split(/[,\u060C]/).map((entry) => entry.trim()).filter(Boolean)

/** Scheduling resources (spec §19.1): anything with time and capacity — technician, courier, room, vehicle, seats. */
export const schedulingResourcesResource = {
  key: 'schedulingResources',
  endpoint: serviceEndpoints.schedulingResources,
  icon: Wrench,
  i18nKey: 'service.settings.resources.schedulingResources',
  titleField: 'name',
  dependsOn: ['businessCalendars'],
  invalidates: [serviceKeys.scheduling()],
  emptyValue: () => ({ name: L(), type: 'technician', capacity: 1, calendar_id: 'cal-main', skills_text: '', zones_text: '', vehicle: '', daily_capacity: null, status: 'active' }),
  fromItem: (item) => ({ ...item, skills_text: (item.skills || []).join(', '), zones_text: (item.zones || []).join(', '), active: item.status !== 'inactive' }),
  toPayload: ({ skills_text: skills, zones_text: zones, active, ...values }) => ({ ...values, capacity: Number(values.capacity) || 1, skills: splitTags(skills), zones: splitTags(zones), status: active === false ? 'inactive' : 'active' }),
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'type', type: 'select', labelKey: 'service.scheduling.fields.type', row: 'a', options: (ctx) => RESOURCE_TYPES.map((value) => ({ value, label: ctx.t(`service.scheduling.types.${value}`) })) },
    { name: 'capacity', type: 'number', labelKey: 'service.scheduling.fields.capacity', hintKey: 'service.scheduling.fields.capacityHint', row: 'a' },
    { name: 'calendar_id', type: 'select', labelKey: 'service.settings.fields.businessCalendar', options: (ctx) => labelOptions(listOf(ctx, 'businessCalendars'), ctx.language, 'name') },
    { name: 'skills_text', type: 'text', ltr: true, labelKey: 'service.scheduling.fields.skills', hintKey: 'service.scheduling.fields.tagsHint', row: 'b' },
    { name: 'zones_text', type: 'text', ltr: true, labelKey: 'service.scheduling.fields.zones', hintKey: 'service.scheduling.fields.tagsHint', row: 'b' },
    { name: 'vehicle', type: 'text', labelKey: 'service.scheduling.fields.vehicle', row: 'c', hiddenWhen: (values) => values.type !== 'courier' },
    { name: 'daily_capacity', type: 'number', labelKey: 'service.scheduling.fields.dailyCapacity', row: 'c', hiddenWhen: (values) => values.type !== 'courier' },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) =>
    [ctx.t(`service.scheduling.types.${item.type}`), ctx.t('service.scheduling.capacityValue', { count: item.capacity }), listText(item.skills, ctx.language), listText(item.zones, ctx.language)].filter(Boolean).join(' · '),
}
