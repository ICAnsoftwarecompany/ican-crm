import {
  businessCalendarsResource,
  caseTypesResource,
  escalationRulesResource,
  queuesResource,
  slaPoliciesResource,
} from './operationsResources'
import { kbCategoriesResource, macrosResource, savedRepliesResource } from './communicationResources'
import { itemTypesResource, pipelinesResource, recordTypesResource } from './catalogResources'
import { contractTypesResource } from './contractResources'
import { paymentPlansResource, planAssignmentsResource } from './billingResources'
import { Package, Wand2 } from 'lucide-react'
import { SetupWizardPanel } from '../../setup/components/SetupWizardPanel'
import { CatalogItemsPanel } from '../../catalog/components/CatalogItemsPanel'

/** A section can also be a custom panel (`component`) instead of a CRUD list. */
const setupSection = { key: 'setup', icon: Wand2, i18nKey: 'service.settings.resources.setup', component: SetupWizardPanel }
const catalogItemsSection = { key: 'catalogItems', icon: Package, i18nKey: 'service.settings.resources.catalogItems', component: CatalogItemsPanel }

/**
 * Every configuration screen under /service/settings/:section.
 * Adding a screen = add a resource definition + list it in a group here +
 * add `service.settings.resources.<key>` copy. No new page or dialog needed.
 * Later sub-modules (replies, knowledge…) append their own resources.
 */
export const SETTINGS_GROUPS = [
  { key: 'general', resources: [setupSection] },
  { key: 'cases', resources: [caseTypesResource, queuesResource] },
  { key: 'catalog', resources: [catalogItemsSection, itemTypesResource, recordTypesResource, pipelinesResource] },
  { key: 'contracts', resources: [contractTypesResource] },
  { key: 'billing', resources: [paymentPlansResource, planAssignmentsResource] },
  { key: 'sla', resources: [slaPoliciesResource, businessCalendarsResource, escalationRulesResource] },
  { key: 'communication', resources: [savedRepliesResource, macrosResource] },
  { key: 'knowledge', resources: [kbCategoriesResource] },
]

export const SETTINGS_RESOURCES = SETTINGS_GROUPS.flatMap((group) => group.resources)

const SECTION_SLUGS = {
  caseTypes: 'case-types',
  queues: 'queues',
  slaPolicies: 'sla-policies',
  businessCalendars: 'business-calendars',
  escalationRules: 'escalation-rules',
  savedReplies: 'saved-replies',
  macros: 'macros',
  kbCategories: 'kb-categories',
  catalogItems: 'catalog-items',
  itemTypes: 'item-types',
  recordTypes: 'record-types',
  pipelines: 'pipelines',
  contractTypes: 'contract-types',
  setup: 'setup',
  paymentPlans: 'payment-plans',
  planAssignments: 'plan-assignments',
}

/** URL slug for a resource (kebab-case, stable). */
export const getSettingsSlug = (key) => SECTION_SLUGS[key] || key

export function getSettingsResource(keyOrSlug) {
  return SETTINGS_RESOURCES.find((resource) => resource.key === keyOrSlug || getSettingsSlug(resource.key) === keyOrSlug) || null
}
