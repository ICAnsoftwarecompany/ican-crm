/**
 * The AI setup data model shared by every module's "AI setup" page. Presentation-level only:
 * the future `features/ai` domain owns models, prompts, providers, usage limits and the API, and
 * plugs in through AiSetupPage's `initialValues` / `onSave` props (see README.md).
 */

export const AI_TONES = ['professional', 'friendly', 'concise']
export const AI_LANGUAGES = ['auto', 'ar', 'en']
export const AI_AUTONOMY_LEVELS = ['suggest', 'draft', 'act']

export const DEFAULT_AI_SETUP = {
  enabled: false,
  capabilities: [],
  tone: 'professional',
  language: 'auto',
  autonomy: 'suggest',
  instructions: '',
  handoffToHuman: true,
}

const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback)

/**
 * Coerces any stored/remote value into a valid setup. Unknown capability ids (e.g. a capability
 * that a module stopped offering) are dropped, never kept silently.
 */
export function normalizeAiSetup(values = {}, capabilityIds = []) {
  const source = values && typeof values === 'object' ? values : {}
  const allowedCapabilities = new Set(capabilityIds)

  return {
    enabled: Boolean(source.enabled),
    capabilities: Array.isArray(source.capabilities)
      ? [...new Set(source.capabilities.filter((id) => allowedCapabilities.has(id)))]
      : [],
    tone: pick(source.tone, AI_TONES, DEFAULT_AI_SETUP.tone),
    language: pick(source.language, AI_LANGUAGES, DEFAULT_AI_SETUP.language),
    autonomy: pick(source.autonomy, AI_AUTONOMY_LEVELS, DEFAULT_AI_SETUP.autonomy),
    instructions: typeof source.instructions === 'string' ? source.instructions : '',
    handoffToHuman: source.handoffToHuman === undefined ? DEFAULT_AI_SETUP.handoffToHuman : Boolean(source.handoffToHuman),
  }
}

export function toggleCapability(capabilities = [], id) {
  return capabilities.includes(id) ? capabilities.filter((item) => item !== id) : [...capabilities, id]
}

export function getAiSetupStorageKey(scopeKey) {
  return `ican-crm:ai-setup:${scopeKey}`
}
