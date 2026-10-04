import { describe, expect, it } from 'vitest'
import {
  buildLeadClosePayload,
  createCloseForm,
  getLeadInterests,
  getLeadOpenDeal,
  getMissingCloseKinds,
  getStatusCloseKind,
  getStatusReasons,
  getStatusesOfKind,
  isReasonRequired,
  resolveCloseMode,
  resolveFollowUpDate,
  validateCloseForm,
} from './leadClose'

// Same shape as GET /api/tenant/definitions/status (2026-10-04).
const open = { id: 1, status: 'status1', is_lost: 0, is_deal: 0, is_retarget: 0, has_resone: 0 }
const won = { id: 2, status: 'حالة البيع القفل', is_lost: 0, is_deal: 1, is_retarget: 0, has_resone: 0 }
const lost = { id: 3, status: 'حالة الخسارة', is_lost: 1, is_deal: 0, is_retarget: 0, has_resone: 0 }
const retarget = { id: 4, status: 'Later', is_retarget: 1, has_resone: 0 }
const now = new Date('2026-10-04T10:00:00')

describe('status kinds and close mode', () => {
  it('reads the kind from the status flags', () => {
    expect([open, won, lost, retarget].map(getStatusCloseKind)).toEqual([null, 'won', 'lost', 'retarget'])
    expect(getStatusesOfKind([open, won, lost, { id: 10, is_deal: '1' }], 'won').map((s) => s.id)).toEqual([2, 10])
  })

  it('opens the dialog for sale / lost / retarget / reopen, not for a plain move', () => {
    expect(resolveCloseMode(open, won)).toBe('won')
    expect(resolveCloseMode(open, lost)).toBe('lost')
    expect(resolveCloseMode(open, retarget)).toBe('retarget')
    expect(resolveCloseMode(lost, retarget)).toBe('retarget')
    expect(resolveCloseMode(lost, open)).toBe('reopen')
    expect(resolveCloseMode(retarget, open)).toBeNull()
    expect(resolveCloseMode(open, { id: 9 })).toBeNull()
  })

  it('reports a tenant with no sale or no lost status', () => {
    expect(getMissingCloseKinds([open, won, lost])).toEqual([])
    expect(getMissingCloseKinds([open, retarget])).toEqual(['won', 'lost'])
  })
})

describe('reasons per status', () => {
  it('uses the status own list (active, ordered) when the backend sends it', () => {
    const withReasons = { ...lost, reasons: [{ id: 12, key: 'budget', label: 'الميزانية', active: 1, order: 2 }, { id: 11, key: 'price', label: 'السعر', active: 1, order: 1 }, { id: 13, key: 'old', label: 'x', active: 0 }] }
    expect(getStatusReasons(withReasons)).toEqual([{ id: 11, key: 'price', label: 'السعر' }, { id: 12, key: 'budget', label: 'الميزانية' }])
  })

  it('falls back to the default list for lost, none for sale / retarget', () => {
    expect(getStatusReasons(lost).map((reason) => reason.key)).toContain('price')
    expect(getStatusReasons(won)).toEqual([])
    expect(getStatusReasons(retarget)).toEqual([])
  })

  it('requires a reason for lost, and for sale / retarget only with own reasons + has_resone', () => {
    expect(isReasonRequired('lost', lost)).toBe(true)
    expect(isReasonRequired('won', won)).toBe(false)
    expect(isReasonRequired('won', { ...won, has_resone: 1, reasons: [{ key: 'price', label: 'Price' }] })).toBe(true)
    expect(isReasonRequired('won', { ...won, has_resone: 0, reasons: [{ key: 'price', label: 'Price' }] })).toBe(false)
  })
})

describe('validateCloseForm', () => {
  it('lost: reason required, note for "other", date for a custom follow-up', () => {
    const form = createCloseForm('lost', lost)
    expect(validateCloseForm(form, { status: lost })).toEqual({ reason: 'reasonRequired' })
    expect(validateCloseForm({ ...form, reason: 'other' }, { status: lost })).toEqual({ note: 'noteRequiredForOther' })
    expect(validateCloseForm({ ...form, reason: 'price', followUp: 'custom' }, { status: lost })).toEqual({ followUpDate: 'dateRequired' })
    expect(validateCloseForm({ ...form, reason: 'price' }, { status: lost })).toEqual({})
  })

  it('retarget: a follow-up is required (30 days by default)', () => {
    const form = createCloseForm('retarget', retarget)
    expect(form.followUp).toBe('30')
    expect(validateCloseForm(form, { status: retarget })).toEqual({})
    expect(validateCloseForm({ ...form, followUp: '' }, { status: retarget })).toEqual({ followUp: 'followUpRequired' })
  })

  it('sale: one lead at a time, never for a lead in an open deal; adding to a deal needs the deal', () => {
    const form = createCloseForm('won', won)
    expect(validateCloseForm(form, { status: won })).toEqual({})
    expect(validateCloseForm(form, { status: won, bulk: true })).toEqual({ mode: 'wonSingleOnly' })
    expect(validateCloseForm(form, { status: won, openDeal: { dealId: '1' } })).toEqual({ mode: 'inOpenDeal' })
    expect(validateCloseForm({ ...form, wonValue: '-5' }, { status: won })).toEqual({ wonValue: 'negative' })
    expect(validateCloseForm({ ...form, target: 'deal' }, { status: won, bulk: true })).toEqual({ dealId: 'dealRequired' })
    expect(validateCloseForm({ ...form, target: 'deal', dealId: '4' }, { status: won, bulk: true })).toEqual({})
  })

  it('reopen needs a note', () => {
    expect(validateCloseForm(createCloseForm('reopen', open), { status: open })).toEqual({ note: 'reopenNoteRequired' })
  })
})

describe('buildLeadClosePayload', () => {
  it('keeps the existing saveAction shape and puts the close data in `data`', () => {
    const form = { ...createCloseForm('lost', lost), reason: 'price', note: 'Too high', followUp: '30' }
    const body = buildLeadClosePayload({ leadId: 5, form, status: lost, oldStatus: open, labels: { title: 'Lost', reasonLabel: 'Price' }, activityAt: '2026-10-04 10:00:00', now })
    expect(body).toEqual({
      lead_id: 5,
      action: 'create_activity',
      type: 'note-to-lead',
      title: 'Lost',
      description: 'Price — Too high',
      note: 'Price — Too high',
      data: { source: 'lead_close', close_type: 'lost', reason_key: 'price', lost_reason_key: 'price', follow_up_at: '2026-11-03' },
      new_status_id: 3,
      new_status_title: 'حالة الخسارة',
      old_status_title: 'status1',
      activity_at: '2026-10-04 10:00:00',
    })
  })

  it('sends the backend reason id, sale value and interest', () => {
    const status = { ...won, reasons: [{ id: 21, key: 'relationship', label: 'العلاقة' }] }
    const form = { ...createCloseForm('won', status), reason: 'relationship', wonValue: '1500', interestId: '33' }
    const body = buildLeadClosePayload({ leadId: 5, form, status, labels: { description: 'Won' }, now })
    expect(body.data).toEqual({ source: 'lead_close', close_type: 'won', reason_key: 'relationship', reason_id: 21, won_value: 1500, interest_id: 33 })
  })

  it('retarget sends its follow-up date', () => {
    const body = buildLeadClosePayload({ leadId: 5, form: createCloseForm('retarget', retarget), status: retarget, now })
    expect(body.data).toEqual({ source: 'lead_close', close_type: 'retarget', follow_up_at: '2026-11-03' })
  })

  it('resolves follow-up dates', () => {
    expect(resolveFollowUpDate({ mode: 'lost', followUp: '7' }, now)).toBe('2026-10-11')
    expect(resolveFollowUpDate({ mode: 'retarget', followUp: 'custom', followUpDate: '2027-01-01' }, now)).toBe('2027-01-01')
    expect(resolveFollowUpDate({ mode: 'won', followUp: '7' }, now)).toBe('')
  })
})

describe('lead row helpers', () => {
  it('lists interests once', () => {
    const customer = { interesteds: [{ id: 1, product: { name: 'Villa' } }], lead: { interesteds: [{ id: 1 }, { id: 2, product_name: 'Car', is_lost: 1 }] } }
    expect(getLeadInterests(customer)).toEqual([{ id: '1', name: 'Villa', isLost: false }, { id: '2', name: 'Car', isLost: true }])
  })

  it('finds the open deal of a lead when the row carries it', () => {
    expect(getLeadOpenDeal({ lead: { deals: [{ deal_id: 4, deal_name: 'Q4', status: 'won' }, { deal_id: 1, deal_name: 'Villas', status: 'open' }] } })).toEqual({ dealId: '1', dealName: 'Villas' })
    expect(getLeadOpenDeal({ lead: { deals: [{ deal_id: 4, status: 'lost' }] } })).toBeNull()
    expect(getLeadOpenDeal({ lead: {} })).toBeNull()
  })
})
