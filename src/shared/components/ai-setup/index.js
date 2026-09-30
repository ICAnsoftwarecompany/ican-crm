// Public API of the shared AI setup UI. Presentation only — the future `features/ai` domain owns
// models, prompts, providers, quotas and the API. See README.md in this folder.
export { AiSetupPage } from './AiSetupPage'
export { AiCapabilityList } from './AiCapabilityList'
export { AiBehaviorFields } from './AiBehaviorFields'
export { AiSetupSection, AiToggle } from './AiSetupSection'
export { useAiSetupDraft } from './useAiSetupDraft'
export {
  AI_AUTONOMY_LEVELS,
  AI_LANGUAGES,
  AI_TONES,
  DEFAULT_AI_SETUP,
  getAiSetupStorageKey,
  normalizeAiSetup,
  toggleCapability,
} from './aiSetupModel'
