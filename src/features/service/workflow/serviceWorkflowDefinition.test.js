import { describe, expect, it } from 'vitest'
import { getActions, getConditions, getDataSource, getModule, getTriggers } from '../../workflow-engine'

describe('Customer Hub workflow module', () => {
  it('is registered in the shared engine with backend-pending capabilities and fixed option sources', () => {
    expect(getModule('customer_service')).toBeTruthy()
    expect(getTriggers('customer_service').map((entry) => entry.id)).toEqual(expect.arrayContaining(['case.created', 'feedback.low_score', 'health.band_changed']))
    expect(getConditions('customer_service').map((entry) => entry.id)).toContain('ai.sentiment')
    expect(getActions('customer_service').every((entry) => entry.backendSupport === false)).toBe(true)
    expect(getDataSource('service_priorities').options.map((option) => option.value)).toEqual(['low', 'normal', 'high', 'urgent'])
  })
})
