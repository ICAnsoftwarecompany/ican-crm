import { KNOWN_OUTCOMES } from '../constants/followUps'

/** Outcome keys are program data; known ones are translated, custom ones are shown as their key. */
export const outcomeLabel = (t, outcome) => (KNOWN_OUTCOMES.includes(outcome) ? t(`service.followUps.outcomes.${outcome}`) : outcome)
