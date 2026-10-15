/**
 * Lead source of a new deal (wizard step "source", 2026-10-16). Pure helpers, no React.
 *
 * mode:
 * - `campaigns` — the deal is linked to one or more CRM campaigns (`POST /deals/{id}/campaigns`).
 * - `leads`     — a "free" deal: leads already in the CRM (`POST /deals/leads/add-existing`, one request) and/or new
 *                 leads typed, pasted or read from a file (`POST /deals/leads/create`, one request per lead).
 * - `later`     — nothing now; leads are added from the deal workspace.
 */
export const LEAD_SOURCE_MODES = ['campaigns', 'leads', 'later']
export const MAX_NEW_LEADS = 300

export function createLeadSourceState() {
  return { mode: '', campaignIds: [], campaignsActive: true, existing: [], rows: [], ownerId: '', stageId: '' }
}

let keySeed = 0
export const newRowKey = () => `r${Date.now().toString(36)}${(keySeed += 1).toString(36)}`

/** Digits only (a leading + kept) so "0100 123-4567" and "01001234567" are the same number. */
export function normalizePhone(value = '') {
  const text = String(value ?? '').trim()
  const digits = text.replace(/[^\d]/g, '')
  return text.startsWith('+') && digits ? `+${digits}` : digits
}

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value))
const looksLikePhone = (value) => {
  const text = clean(value)
  return /^[+\d][\d\s\-().]*$/.test(text) && text.replace(/\D/g, '').length >= 7
}

// Header aliases (Arabic + English, lower case, no spaces).
const HEADERS = {
  name: ['name', 'fullname', 'leadname', 'customer', 'customername', 'client', 'الاسم', 'اسم', 'الاسمبالكامل', 'اسمالعميل', 'العميل'],
  phone: ['phone', 'mobile', 'phonenumber', 'tel', 'telephone', 'whatsapp', 'number', 'الهاتف', 'هاتف', 'الموبايل', 'موبايل', 'رقمالهاتف', 'الرقم', 'رقم', 'الجوال', 'جوال', 'واتساب'],
  email: ['email', 'e-mail', 'mail', 'البريد', 'البريدالإلكتروني', 'البريدالالكتروني', 'الإيميل', 'الايميل', 'ايميل'],
  company: ['company', 'organization', 'organisation', 'الشركة', 'شركة', 'الجهة'],
}
const headerField = (cell) => {
  const key = clean(cell).toLowerCase().replace(/[\s_]/g, '')
  return Object.keys(HEADERS).find((field) => HEADERS[field].includes(key)) || null
}

/** Without a header: email = the cell with @, phone = the number-like cell, name / company = the first text cells. */
function guessRow(cells) {
  const row = { name: '', phone: '', email: '', company: '' }
  cells.map(clean).filter(Boolean).forEach((cell) => {
    if (!row.email && looksLikeEmail(cell)) row.email = cell
    else if (!row.phone && looksLikePhone(cell)) row.phone = cell
    else if (!row.name) row.name = cell
    else if (!row.company) row.company = cell
  })
  return row
}

/**
 * Rows of cells (from a paste or the first sheet of a file) → lead rows `{ key, name, phone, email, company }`.
 * A first row whose cells are known column names ("Name", "الهاتف", …) maps the columns; otherwise each row is
 * guessed. Empty rows are dropped.
 */
export function parseLeadMatrix(matrix = []) {
  const rows = matrix.filter((cells) => Array.isArray(cells) && cells.some((cell) => clean(cell)))
  if (!rows.length) return []
  const columns = rows[0].map(headerField)
  const hasHeader = columns.includes('name') || columns.includes('phone')
  const body = hasHeader ? rows.slice(1) : rows
  return body.map((cells) => {
    const row = hasHeader
      ? columns.reduce((acc, field, index) => (field && !acc[field] ? { ...acc, [field]: clean(cells[index]) } : acc), { name: '', phone: '', email: '', company: '' })
      : guessRow(cells)
    return { key: newRowKey(), ...row }
  }).filter((row) => row.name || row.phone || row.email)
}

/** Text pasted from Excel / Sheets (tabs) or typed as CSV (commas / semicolons), one lead per line. */
export function parseLeadText(text = '') {
  const lines = String(text).split(/\r?\n/)
  const separator = lines.some((line) => line.includes('\t')) ? '\t' : /[,;؛،]/
  return parseLeadMatrix(lines.map((line) => line.split(separator)))
}

/**
 * Errors per new row: `{ [key]: { name?, phone?, email? } }` (i18n keys under `wizard.errors`). A phone used twice in
 * the list, or by a lead already picked from the CRM, is a duplicate.
 */
export function validateLeadRows(rows = [], existing = []) {
  const seen = new Map()
  existing.forEach((lead) => { const phone = normalizePhone(lead.phone); if (phone) seen.set(phone, 'existing') })
  const errors = {}
  rows.forEach((row) => {
    const rowErrors = {}
    const phone = normalizePhone(row.phone)
    if (!clean(row.name)) rowErrors.name = 'leadNameRequired'
    if (!phone) rowErrors.phone = 'leadPhoneRequired'
    else if (phone.replace('+', '').length < 7) rowErrors.phone = 'leadPhoneInvalid'
    else if (seen.has(phone)) rowErrors.phone = 'leadPhoneDuplicate'
    else seen.set(phone, row.key)
    if (row.email && !looksLikeEmail(row.email)) rowErrors.email = 'leadEmailInvalid'
    if (Object.keys(rowErrors).length) errors[row.key] = rowErrors
  })
  return errors
}

/** Errors of the step (`wizard.errors.*` keys). */
export function validateLeadSource(source = createLeadSourceState()) {
  const errors = {}
  if (!LEAD_SOURCE_MODES.includes(source.mode)) errors.mode = 'sourceRequired'
  if (source.mode === 'campaigns' && !source.campaignIds.length) errors.campaigns = 'campaignsRequired'
  if (source.mode === 'leads') {
    if (!source.existing.length && !source.rows.length) errors.leads = 'leadsRequired'
    if (source.rows.length > MAX_NEW_LEADS) errors.leads = 'tooManyLeads'
    else if (Object.keys(validateLeadRows(source.rows, source.existing)).length) errors.leads = 'leadRowsInvalid'
  }
  return errors
}

const toId = (value) => {
  const number = Number(value)
  return value !== '' && value !== null && value !== undefined && Number.isFinite(number) ? number : value
}

/** `POST /deals/{id}/campaigns` body, or null. */
export function buildCampaignsPayload(source) {
  if (source?.mode !== 'campaigns' || !source.campaignIds.length) return null
  return { campaign_ids: source.campaignIds.map(toId), is_active: source.campaignsActive !== false }
}

/** `POST /deals/leads/add-existing` body, or null. `stage_id` only when one was chosen (else the backend's first stage). */
export function buildExistingLeadsPayload(source, dealId) {
  if (source?.mode !== 'leads' || !source.existing.length) return null
  return {
    deal_id: toId(dealId),
    lead_ids: source.existing.map((lead) => toId(lead.id)),
    ...(source.ownerId ? { owner_id: toId(source.ownerId) } : {}),
    ...(source.stageId ? { stage_id: toId(source.stageId) } : {}),
  }
}

/** `POST /deals/leads/create` body for one new row. */
export function buildNewLeadPayload(row, source, dealId) {
  return Object.fromEntries(Object.entries({
    deal_id: toId(dealId),
    name: clean(row.name),
    phone: clean(row.phone),
    email: clean(row.email) || undefined,
    company: clean(row.company) || undefined,
    type: 'lead',
    source: 'manual',
    linked_type: 'manual',
    owner_id: source.ownerId ? toId(source.ownerId) : undefined,
  }).filter(([, value]) => value !== undefined))
}

/** New rows to send for leads mode (empty otherwise). */
export function newLeadRows(source) {
  return source?.mode === 'leads' ? source.rows : []
}

/** Counts for summaries: `{ campaigns, existing, created }`. */
export function countLeadSource(source = createLeadSourceState()) {
  return {
    campaigns: source.mode === 'campaigns' ? source.campaignIds.length : 0,
    existing: source.mode === 'leads' ? source.existing.length : 0,
    created: source.mode === 'leads' ? source.rows.length : 0,
  }
}
