import {
  businessCalendarsResource,
  caseTypesResource,
  escalationRulesResource,
  queuesResource,
  slaPoliciesResource,
} from './operationsResources'
import { kbCategoriesResource, macrosResource, savedRepliesResource } from './communicationResources'

/**
 * Every configuration screen under /service/settings/:section.
 * Adding a screen = add a resource definition + list it in a group here +
 * add `service.settings.resources.<key>` copy. No new page or dialog needed.
 * Later sub-modules (replies, knowledge…) append their own resources.
 */
export const SETTINGS_GROUPS = [
  { key: 'cases', resources: [caseTypesResource, queuesResource] },
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
}

/** URL slug for a resource (kebab-case, stable). */
export const getSettingsSlug = (key) => SECTION_SLUGS[key] || key

export function getSettingsResource(keyOrSlug) {
  return SETTINGS_RESOURCES.find((resource) => resource.key === keyOrSlug || getSettingsSlug(resource.key) === keyOrSlug) || null
}
