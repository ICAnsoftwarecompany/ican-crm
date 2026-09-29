import { describe, expect, it } from 'vitest'
import { PIPELINE_ITEM_ID_FIELD, PIPELINE_STAGE_FIELD, UNSTAGED_PIPELINE_STAGE_ID } from '../constants'
import {
  applyStatusToCustomersPages,
  buildPipelineStages,
  buildStatusChangePayload,
  countCustomersByStage,
  filterCustomersBySearch,
  getCustomerStatusId,
  toPipelineItems,
} from './customerPipeline'

const statuses = [
  { id: 1, status: 'New', color: '#00C2CB' },
  { id: 2, status: 'Contacted', color: '#F59E0B' },
  { id: 3, status: 'Lost', color: '#EF4444', has_resone: 1 },
]

const rows = [
  { id: 10, lead: { id: 100, name: 'Mona Ali', phone: '+20 100 123 4567', status_type_id: 1 } },
  { id: 11, lead: { id: 101, name: 'Omar', email: 'omar@example.com', status: { id: 2 } } },
  { id: 12, lead: { id: 102, name: 'No status' } },
  { id: 13, lead: { id: 103, name: 'Inactive status', status_type_id: 99 } },
]

describe('customerPipeline utils', () => {
  it('resolves the status id from the lead first, then the customer', () => {
    expect(getCustomerStatusId(rows[0])).toBe('1')
    expect(getCustomerStatusId(rows[1])).toBe('2')
    expect(getCustomerStatusId({ status_type_id: 5 })).toBe('5')
    expect(getCustomerStatusId(rows[2])).toBe('')
  })

  it('puts leads without an active status in the unstaged column', () => {
    const items = toPipelineItems(rows, statuses)
    expect(items.map((item) => item[PIPELINE_STAGE_FIELD])).toEqual(['1', '2', UNSTAGED_PIPELINE_STAGE_ID, UNSTAGED_PIPELINE_STAGE_ID])
    expect(items[0][PIPELINE_ITEM_ID_FIELD]).toBe('10')
    expect(rows[0][PIPELINE_STAGE_FIELD]).toBeUndefined()
  })

  it('adds the unstaged column only when needed and respects a selected status', () => {
    const items = toPipelineItems(rows, statuses)
    expect(buildPipelineStages(statuses, items, { unstagedLabel: 'None' }).map((stage) => stage.id))
      .toEqual([UNSTAGED_PIPELINE_STAGE_ID, '1', '2', '3'])
    expect(buildPipelineStages(statuses, toPipelineItems(rows.slice(0, 2), statuses)).map((stage) => stage.id))
      .toEqual(['1', '2', '3'])
    expect(buildPipelineStages(statuses, items, { selectedStatusId: 2 }).map((stage) => stage.id)).toEqual(['2'])
  })

  it('counts items per stage', () => {
    expect(countCustomersByStage(toPipelineItems(rows, statuses))).toEqual({ 1: 1, 2: 1, [UNSTAGED_PIPELINE_STAGE_ID]: 2 })
  })

  it('searches name, email and phone digits', () => {
    expect(filterCustomersBySearch(rows, 'mona').map((row) => row.id)).toEqual([10])
    expect(filterCustomersBySearch(rows, 'OMAR@').map((row) => row.id)).toEqual([11])
    expect(filterCustomersBySearch(rows, '1001234').map((row) => row.id)).toEqual([10])
    expect(filterCustomersBySearch(rows, '  ')).toBe(rows)
  })

  it('builds the same saveAction payload as the other status changers', () => {
    const plain = buildStatusChangePayload({ leadId: 100, status: statuses[1], oldStatus: statuses[0], title: 'T', description: 'D', activityAt: 'now' })
    expect(plain).toMatchObject({ lead_id: 100, action: 'create_activity', type: 'status_change', description: 'D', note: '', new_status_id: 2, new_status_title: 'Contacted', old_status_title: 'New' })

    const withReason = buildStatusChangePayload({ leadId: 100, status: statuses[2], oldStatus: statuses[0], reason: 'price', title: 'T', description: 'D', activityAt: 'now' })
    expect(withReason).toMatchObject({ type: 'note-to-lead', description: 'price', note: 'price', new_status_id: 3 })
  })

  it('applies an optimistic status to the infinite customers cache', () => {
    const data = { pages: [{ data: [rows[0], rows[1]] }, { data: [rows[2]] }], pageParams: [null, 'c'] }
    const next = applyStatusToCustomersPages(data, '10', statuses[1])
    expect(next.pages[0].data[0].lead.status_type_id).toBe(2)
    expect(next.pages[0].data[1]).toBe(rows[1])
    expect(data.pages[0].data[0].lead.status_type_id).toBe(1)
    expect(applyStatusToCustomersPages(data, 'missing', statuses[1])).toBe(data)
  })
})
