// Per-stage "virtual field id" shown in the Guide panel when nothing is
// currently focused. Guide copy itself lives in locale files
// (campaigns.create.guide.<fieldId>.title/body) rather than a JS lookup
// table — a field id is always `<stage>.<fieldName>`, so its translation
// key can be computed directly (see GuidePanel.jsx), keeping the locale
// file the single source of truth instead of duplicating a map here.
export const STAGE_DEFAULT_GUIDE_FIELD = {
  objective: 'objective.default',
  campaignSetup: 'campaignSetup.default',
}
