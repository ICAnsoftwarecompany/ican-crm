import { describe, expect, it } from 'vitest'
import {
  buildLeadClosePayload,
  createCloseForm,
  getLeadInterests,
  getStatusCloseKind,
  getStatusesOfKind,
  resolveCloseMode,
  resolveFollowUpDate,
  validateCloseForm,
} from './leadClose'

const open = { id: 1, status: 'New' }
const won = { id: 7, status: 'Sold', is_deal: 1 }
const lost = { id: 8, status: 'Lost', is_lost: '1', has_resone: 1 }
const retarget = { id: 9, status: 'Later', is_retarget: 1 }

describe('status kinds and close mode', () => {
  it('reads the kind from the status flags', () => {
    expect([open, won, lost, retarget].map(getStatusCloseKind)).toEqual([null, 'won', 'lost', 'retarget'])
    expect(getStatusesOfKind([open, won, lost, { id: 10, is_deal: '1' }], 'won').map((s) => s.id)).toEqual([7, 10])
  })

  it('opens the dialog for a close or a reopen, not for a plain move', () => {
    expect(resolveCloseMode(open, won)).toBe('won')
    expect(resolveCloseMode(open, lost)).toBe('lost')
    expect(resolveCloseMode(lost, open)).toBe('reopen')
    expect(resolveCloseMode(won, retarget)).toBe('reopen')
    expect(resolveCloseMode(open, retarget)).toBeNull()
    expect(resolveCloseMode(null, open)).toBeNull()
  })
})

describe('validateCloseForm', () => {
  it('needs a reason for lost, a note for "other" and a date for a custom follow-up', () => {
    const form = createCloseForm('lost', lost)
    expect(validateCloseForm(form)).toEqual({ lostReason: 'reasonRequired' })
    expect(validateCloseForm({ ...form, lostReason: 'other' })).toEqual({ note: 'noteRequiredForOther' })
    expect(validateCloseForm({ ...form, lostReason: 'price', followUp: 'custom' })).toEqual({ followUpDate: 'dateRequired' })
    expect(validateCloseForm({ ...form, lostReason: 'price' })).toEqual({})
  })

  it('allows won for one lead only and needs a note to reopen', () => {
    expect(validateCloseForm(createCloseForm('won', won), { bulk: true })).toEqual({ mode: 'wonSingleOnly' })
    expect(validateCloseForm({ ...createCloseForm('won', won), wonValue: '-5' })).toEqual({ wonValue: 'negative' })
    expect(validateCloseForm(createCloseForm('reopen', open))).toEqual({ note: 'reopenNoteRequired' })
  })
})

describe('buildLeadClosePayload', () => {
  const now = new Date('2026-10-04T10:00:00')

  it('keeps the existing saveAction shape and puts the close data in `data`', () => {
    const form = { ...createCloseForm('lost', lost), lostReason: 'price', note: 'Too high', followUp: '30' }
    const body = buildLeadClosePayload({ leadId: 5, form, status: lost, oldStatus: open, labels: { title: 'Lost', reasonLabel: 'Price' }, activityAt: '2026-10-04 10:00:00', now })
    expect(body).toEqual({
      lead_id: 5,
      action: 'create_activity',
      type: 'note-to-lead',
      title: 'Lost',
      description: 'Price — Too high',
      note: 'Price — Too high',
      data: { source: 'lead_close', close_type: 'lost', lost_reason_key: 'price', follow_up_at: '2026-11-03' },
      new_status_id: 8,
      new_status_title: 'Lost',
      old_status_title: 'New',
      activity_at: '2026-10-04 10:00:00',
    })
  })

  it('sends value and interest on a win', () => {
    const form = { ...createCloseForm('won', won), wonValue: '1500', interestId: '33' }
    const body = buildLeadClosePayload({ leadId: 5, form, status: won, oldStatus: open, labels: { description: 'Won' } })
    expect(body.type).toBe('status_change')
    expect(body.description).toBe('Won')
    expect(body.data).toEqual({ source: 'lead_close', close_type: 'won', won_value: 1500, interest_id: 33 })
  })

  it('resolves follow-up dates', () => {
    expect(resolveFollowUpDate({ mode: 'lost', followUp: '7' }, now)).toBe('2026-10-11')
    expect(resolveFollowUpDate({ mode: 'lost', followUp: 'custom', followUpDate: '2027-01-01' }, now)).toBe('2027-01-01')
    expect(resolveFollowUpDate({ mode: 'won', followUp: '7' }, now)).toBe('')
  })
})

it('lists a lead row interests once', () => {
  const customer = { interesteds: [{ id: 1, product: { name: 'Villa' } }], lead: { interesteds: [{ id: 1 }, { id: 2, product_name: 'Car', is_lost: 1 }] } }
  expect(getLeadInterests(customer)).toEqual([{ id: '1', name: 'Villa', isLost: false }, { id: '2', name: 'Car', isLost: true }])
})
