import { describe, expect, it } from 'vitest'
import { resolveCustomerManagementTemplate } from './industryTemplateConfig'

describe('resolveCustomerManagementTemplate', () => {
  it('resolves known industries', () => {
    expect(resolveCustomerManagementTemplate('shipping')).toMatchObject({
      key: 'shipping',
      directory: { columns: expect.arrayContaining(['code', 'phone']) },
      tickets: { key: 'shipping' },
      reports: { tabs: ['overview', 'feedback', 'quality'] },
    })
  })

  it('uses devices as fallback for missing and unknown values', () => {
    expect(resolveCustomerManagementTemplate(null).key).toBe('devices')
    expect(resolveCustomerManagementTemplate('other').key).toBe('devices')
  })
})
