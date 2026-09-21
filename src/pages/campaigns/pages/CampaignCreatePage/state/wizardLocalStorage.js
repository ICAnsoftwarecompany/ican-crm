// Local-only draft persistence for the campaign wizard — see the
// "Save Draft" section of CAMPAIGN_CENTER_ARCHITECTURE_AR.md. Scoped to
// tenant+platform+account so two tenants sharing a browser profile (or two
// ad accounts within one tenant) never see each other's draft.
const DRAFT_VERSION = 1

function buildDraftKey({ tenantId, platformId, accountId }) {
  return `ican-campaign-wizard-draft:${tenantId || 'unknown'}:${platformId || 'unknown'}:${accountId || 'unknown'}`
}

export function loadWizardDraft(scope) {
  try {
    const raw = window.localStorage.getItem(buildDraftKey(scope))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?._version !== DRAFT_VERSION || !parsed?.state) return null
    return parsed.state
  } catch {
    return null
  }
}

export function saveWizardDraft(scope, state) {
  try {
    window.localStorage.setItem(buildDraftKey(scope), JSON.stringify({ _version: DRAFT_VERSION, state }))
  } catch {
    // Best-effort only — a failed local save should never block the wizard.
  }
}

export function clearWizardDraft(scope) {
  try {
    window.localStorage.removeItem(buildDraftKey(scope))
  } catch {
    // no-op
  }
}
