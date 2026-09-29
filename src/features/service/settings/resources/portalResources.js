import { ClipboardList, Palette, ShieldCheck, Users } from 'lucide-react'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { CASE_TYPE_ICONS } from '../../cases/components/CaseTypeIcon'
import { RESOURCE_TYPES, splitTags } from './schedulingResources'
import { PolicyRulesField } from '../../portal-admin/components/PolicyRulesField'
import { FormSchemaField } from '../../portal-admin/components/FormSchemaField'
import { PortalAccountsPanel } from '../../portal-admin/components/PortalAccountsPanel'
import { PortalSettingsPanel } from '../../portal-admin/components/PortalSettingsPanel'
import { labelOptions, listOf, listText } from './resourceHelpers'

const L = () => ({ ar: '', en: '' })

/** Portal policies (spec §43.3): object + actions (+ deny). Memberships point to one policy. */
export const portalPoliciesResource = {
  key: 'portalPolicies',
  endpoint: serviceEndpoints.portalPolicies,
  icon: ShieldCheck,
  i18nKey: 'service.settings.resources.portalPolicies',
  titleField: 'name',
  dialogClassName: 'max-w-3xl',
  dependsOn: ['recordTypes'],
  invalidates: [serviceKeys.portalAdmin()],
  emptyValue: () => ({ name: L(), rules: [{ object: 'case', actions: ['view', 'create', 'reply'], deny: [] }], active: true }),
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'rules', type: 'custom', component: PolicyRulesField, labelKey: 'service.portal.fields.rules' },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) => {
    const objects = (item.rules || []).filter((rule) => rule.actions?.length).length
    const denied = (item.rules || []).reduce((sum, rule) => sum + (rule.deny?.length || 0), 0)
    return [ctx.t('service.portal.rulesCount', { count: objects }), denied && ctx.t('service.portal.deniedCount', { count: denied })].filter(Boolean).join(' · ')
  },
}

/** Request catalog (spec §44): what customers can ask for from the portal; each request becomes a case. */
export const requestCatalogResource = {
  key: 'requestCatalog',
  endpoint: serviceEndpoints.requestCatalog,
  icon: ClipboardList,
  i18nKey: 'service.settings.resources.requestCatalog',
  titleField: 'name',
  dialogClassName: 'max-w-3xl',
  dependsOn: ['caseTypes', 'portalPolicies'],
  invalidates: [serviceKeys.portalAdmin()],
  emptyValue: () => ({ name: L(), description: L(), icon: 'FileText', case_type_id: '', form_schema: [], required_documents: [], requires_payment: false, price: null, scheduling_resource_type: '', audience_policy_ids: [], portal_visible: true, status: 'active' }),
  fromItem: (item) => ({ ...item, documents_text: (item.required_documents || []).join(', '), scheduling_resource_type: item.scheduling_resource_type || '', active: item.status !== 'inactive' }),
  toPayload: ({ documents_text: documents, active, ...values }) => ({ ...values, required_documents: splitTags(documents), scheduling_resource_type: values.scheduling_resource_type || null, price: values.requires_payment ? Number(values.price) || 0 : null, status: active === false ? 'inactive' : 'active' }),
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'description', type: 'localizedTextarea', labelKey: 'service.portal.fields.description' },
    { name: 'case_type_id', type: 'select', labelKey: 'service.portal.fields.caseType', hintKey: 'service.portal.fields.caseTypeHint', row: 'a', options: (ctx) => labelOptions(listOf(ctx, 'caseTypes'), ctx.language) },
    { name: 'icon', type: 'select', labelKey: 'service.settings.fields.icon', row: 'a', options: () => Object.keys(CASE_TYPE_ICONS).map((name) => ({ value: name, label: name })) },
    { name: 'form_schema', type: 'custom', component: FormSchemaField, labelKey: 'service.portal.fields.form' },
    { name: 'documents_text', type: 'text', ltr: true, labelKey: 'service.portal.fields.requiredDocuments', hintKey: 'service.portal.fields.documentsHint' },
    { name: 'scheduling_resource_type', type: 'select', labelKey: 'service.portal.fields.scheduling', hintKey: 'service.portal.fields.schedulingHint', placeholderKey: 'service.portal.noScheduling', row: 'b', options: (ctx) => RESOURCE_TYPES.map((value) => ({ value, label: ctx.t(`service.scheduling.types.${value}`) })) },
    { name: 'requires_payment', type: 'switch', labelKey: 'service.portal.fields.requiresPayment', row: 'b' },
    { name: 'price', type: 'number', labelKey: 'service.portal.fields.price', hiddenWhen: (values) => !values.requires_payment },
    { name: 'audience_policy_ids', type: 'checkboxes', labelKey: 'service.portal.fields.audience', hintKey: 'service.settings.fields.emptyMeansAll', options: (ctx) => labelOptions(listOf(ctx, 'portalPolicies'), ctx.language, 'name') },
    { name: 'portal_visible', type: 'switch', labelKey: 'service.catalog.portalVisible' },
    { name: 'active', type: 'switch', labelKey: 'service.settings.fields.active' },
  ],
  summary: (item, ctx) => {
    const caseType = listOf(ctx, 'caseTypes').find((entry) => entry.id === item.case_type_id)
    return [
      labelOptions(caseType ? [caseType] : [], ctx.language)[0]?.label,
      ctx.t('service.portal.fieldsCount', { count: item.form_schema?.length || 0 }),
      item.required_documents?.length && listText(item.required_documents, ctx.language),
      item.scheduling_resource_type && ctx.t(`service.scheduling.types.${item.scheduling_resource_type}`),
    ].filter(Boolean).join(' · ')
  },
}

export const portalAccountsSection = { key: 'portalAccounts', icon: Users, i18nKey: 'service.settings.resources.portalAccounts', component: PortalAccountsPanel }
export const portalBrandingSection = { key: 'portalBranding', icon: Palette, i18nKey: 'service.settings.resources.portalBranding', component: PortalSettingsPanel }
