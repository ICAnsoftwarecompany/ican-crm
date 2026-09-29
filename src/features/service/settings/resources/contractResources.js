import { FileSignature } from 'lucide-react'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { KeyLabelListField } from '../components/fields/KeyLabelListField'

const L = () => ({ ar: '', en: '' })

/** Contract types (spec §27.2): signature requirement, renewal policy and the handoff checklist. */
export const contractTypesResource = {
  key: 'contractTypes',
  endpoint: serviceEndpoints.settings.contractTypes,
  icon: FileSignature,
  i18nKey: 'service.settings.resources.contractTypes',
  invalidates: [serviceKeys.contracts()],
  dialogClassName: 'max-w-2xl',
  emptyValue: () => ({ key: '', label: L(), requires_signature: true, renewal_type: 'manual', checklist: [], active: true }),
  fields: [
    { name: 'label', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'key', type: 'text', ltr: true, labelKey: 'service.settings.fields.key', row: 'a' },
    { name: 'renewal_type', type: 'select', labelKey: 'service.contracts.fields.renewal', row: 'a', options: (ctx) => ['none', 'manual', 'auto'].map((value) => ({ value, label: ctx.t(`service.contracts.renewals.${value}`) })) },
    { name: 'requires_signature', type: 'switch', labelKey: 'service.contracts.requiresSignature' },
    { name: 'checklist', type: 'custom', component: KeyLabelListField, labelKey: 'service.contracts.checklist', hintKey: 'service.contracts.checklistHint' },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) =>
    [ctx.t(`service.contracts.renewals.${item.renewal_type}`, { defaultValue: '' }), item.requires_signature && ctx.t('service.contracts.requiresSignature'), ctx.t('service.contracts.checklistCount', { count: item.checklist?.length || 0 })].filter(Boolean).join(' · '),
}
