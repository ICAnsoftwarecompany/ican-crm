import { Boxes, GitBranch, Layers3 } from 'lucide-react'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { CASE_TYPE_ICONS } from '../../cases/components/CaseTypeIcon'
import { CapabilitiesField } from '../../catalog/components/CapabilitiesField'
import { StatusesField } from '../../pipelines/components/StatusesField'
import { TransitionsField } from '../../pipelines/components/TransitionsField'
import { KeyLabelListField } from '../components/fields/KeyLabelListField'
import { labelOptions, listOf, listText } from './resourceHelpers'

const { settings } = serviceEndpoints
const L = () => ({ ar: '', en: '' })
const KINDS = ['product', 'service', 'plan', 'bundle']

export const pipelineOptions = (ctx, entity) =>
  labelOptions(listOf(ctx, 'pipelines').filter((pipeline) => !entity || pipeline.entity === entity), ctx.language)

/** Item types (spec §25.7): kind + capabilities (+ model preset) + optional record type. */
export const itemTypesResource = {
  key: 'itemTypes',
  endpoint: settings.itemTypes,
  icon: Boxes,
  i18nKey: 'service.settings.resources.itemTypes',
  titleField: 'name',
  dialogClassName: 'max-w-3xl',
  dependsOn: ['recordTypes', 'caseTypes'],
  invalidates: [serviceKeys.catalog()],
  emptyValue: () => ({ key: '', name: L(), kind: 'product', service_model_preset: null, capabilities: [], record_type_id: null, default_case_type_ids: [], active: true }),
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'key', type: 'text', ltr: true, labelKey: 'service.settings.fields.key', row: 'a' },
    { name: 'kind', type: 'select', labelKey: 'service.catalog.kind', row: 'a', options: (ctx) => KINDS.map((value) => ({ value, label: ctx.t(`service.catalog.kinds.${value}`) })) },
    { name: 'capabilities', type: 'custom', component: CapabilitiesField, labelKey: 'service.catalog.capabilities' },
    { name: 'record_type_id', type: 'select', labelKey: 'service.catalog.recordType', hintKey: 'service.catalog.recordTypeHint', placeholderKey: 'service.catalog.noRecord', options: (ctx) => labelOptions(listOf(ctx, 'recordTypes'), ctx.language) },
    { name: 'default_case_type_ids', type: 'checkboxes', labelKey: 'service.catalog.defaultCaseTypes', hintKey: 'service.settings.fields.emptyMeansAll', options: (ctx) => labelOptions(listOf(ctx, 'caseTypes'), ctx.language) },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) =>
    [
      ctx.t(`service.catalog.kinds.${item.kind}`, { defaultValue: item.kind }),
      item.service_model_preset && `${item.service_model_preset} · ${ctx.t(`service.models.${item.service_model_preset}.name`)}`,
      listText((item.capabilities || []).map((entry) => ctx.t(`service.capabilities.${entry.code}.name`)), ctx.language),
    ]
      .filter(Boolean)
      .join(' · '),
}

/** Record types (spec §33.2): pipeline + participants, components, entries, batches. */
export const recordTypesResource = {
  key: 'recordTypes',
  endpoint: settings.recordTypes,
  icon: Layers3,
  i18nKey: 'service.settings.resources.recordTypes',
  dialogClassName: 'max-w-3xl',
  dependsOn: ['pipelines'],
  invalidates: [serviceKeys.catalog(), [...serviceKeys.all, 'records']],
  emptyValue: () => ({
    key: '',
    label: L(),
    icon: 'FileText',
    pipeline_id: null,
    participant_roles: [],
    component_types: [],
    entry_types: [],
    batch_enabled: false,
    batch_label: L(),
    portal_visible: true,
    active: true,
  }),
  fields: [
    { name: 'label', type: 'localized', labelKey: 'service.settings.fields.label' },
    { name: 'key', type: 'text', ltr: true, labelKey: 'service.settings.fields.key', row: 'a' },
    { name: 'icon', type: 'select', labelKey: 'service.settings.fields.icon', row: 'a', options: () => Object.keys(CASE_TYPE_ICONS).map((name) => ({ value: name, label: name })) },
    { name: 'pipeline_id', type: 'select', labelKey: 'service.catalog.pipeline', hintKey: 'service.catalog.pipelineHint', options: (ctx) => pipelineOptions(ctx, 'record') },
    { name: 'participant_roles', type: 'custom', component: KeyLabelListField, withRange: true, labelKey: 'service.catalog.participantRoles', hintKey: 'service.catalog.participantRolesHint' },
    { name: 'component_types', type: 'custom', component: KeyLabelListField, labelKey: 'service.catalog.componentTypes', hintKey: 'service.catalog.componentTypesHint' },
    { name: 'entry_types', type: 'custom', component: KeyLabelListField, labelKey: 'service.catalog.entryTypes', hintKey: 'service.catalog.entryTypesHint' },
    { name: 'batch_enabled', type: 'switch', labelKey: 'service.catalog.batchEnabled', hintKey: 'service.catalog.batchEnabledHint' },
    { name: 'batch_label', type: 'localized', labelKey: 'service.catalog.batchLabel', hiddenWhen: (values) => !values.batch_enabled },
    { name: 'portal_visible', type: 'switch', labelKey: 'service.catalog.portalVisible' },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) =>
    [
      ctx.t('service.catalog.rolesCount', { count: item.participant_roles?.length || 0 }),
      ctx.t('service.catalog.componentsCount', { count: item.component_types?.length || 0 }),
      ctx.t('service.catalog.entriesCount', { count: item.entry_types?.length || 0 }),
      item.batch_enabled && ctx.t('service.catalog.withBatches'),
    ]
      .filter(Boolean)
      .join(' · '),
}

/** Pipelines (spec §11): statuses + transitions; every save is a new version on the server. */
export const pipelinesResource = {
  key: 'pipelines',
  endpoint: settings.pipelines,
  icon: GitBranch,
  i18nKey: 'service.settings.resources.pipelines',
  dialogClassName: 'max-w-4xl',
  invalidates: [serviceKeys.cases(), [...serviceKeys.all, 'records']],
  emptyValue: () => ({ key: '', label: L(), entity: 'record', statuses: [], transitions: [] }),
  fields: [
    { name: 'label', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'key', type: 'text', ltr: true, labelKey: 'service.settings.fields.key', row: 'a' },
    {
      name: 'entity',
      type: 'select',
      labelKey: 'service.pipelines.entity',
      row: 'a',
      disabledWhen: (values) => Boolean(values.id),
      options: (ctx) => ['case', 'record'].map((value) => ({ value, label: ctx.t(`service.pipelines.entities.${value}`) })),
    },
    { name: 'statuses', type: 'custom', component: StatusesField, labelKey: 'service.pipelines.statuses' },
    { name: 'transitions', type: 'custom', component: TransitionsField, labelKey: 'service.pipelines.transitions' },
  ],
  summary: (item, ctx) =>
    [
      ctx.t(`service.pipelines.entities.${item.entity}`, { defaultValue: item.entity }),
      ctx.t('service.pipelines.statusesCount', { count: item.statuses?.length || 0 }),
      ctx.t('service.pipelines.version', { version: item.version || 1 }),
    ].join(' · '),
}
