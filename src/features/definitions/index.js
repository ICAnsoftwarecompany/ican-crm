// Public surface of the definitions feature (statuses, tags). Older consumers still import internal paths.
export { definitionsApi } from './api/definitionsApi'
export { DEFINITIONS_API_STATUS, isDefinitionsApiLive } from './constants/definitionsApiStatus'
export { addReason, buildReasonsPayload, hasDuplicateReason, readStatusReasons, toReasonKey } from './utils/statusReasons'
export { StatusReasonsEditor } from './components/StatusReasonsEditor'
export { CloseKindsNotice } from './components/CloseKindsNotice'
export { useStatuses, useTags, useDefinitionMutations } from './hooks/useDefinitions'
// Lead lost reasons (2026-10-15): /definitions/lost-reasons, managed from the "lost" status.
export { lostReasonsApi } from './api/lostReasonsApi'
export { useLostReasons, useLostReasonMutations, lostReasonsKeys } from './hooks/useLostReasons'
export { LostReasonsManager } from './components/LostReasonsManager'
export { buildLostReasonPayload, normalizeLostReason, sortLostReasons, suggestReasonCode } from './utils/lostReasons'
