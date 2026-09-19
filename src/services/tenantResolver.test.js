import { describe, expect, it } from 'vitest'
import { resolveTenantFromHostname, resolveTenantId, requireTenantId } from './tenantResolver'

describe('resolveTenantFromHostname', () => {
  it('extracts the tenant subdomain from a production host', () => {
    expect(resolveTenantFromHostname('test0002.3s-export.com', '3s-export.com')).toBe('test0002')
  })

  it('returns empty for localhost / loopback hosts', () => {
    expect(resolveTenantFromHostname('localhost', '3s-export.com')).toBe('')
    expect(resolveTenantFromHostname('127.0.0.1', '3s-export.com')).toBe('')
    expect(resolveTenantFromHostname('0.0.0.0', '3s-export.com')).toBe('')
  })

  it('returns empty for the bare root domain (no tenant)', () => {
    expect(resolveTenantFromHostname('3s-export.com', '3s-export.com')).toBe('')
  })

  it('ignores known non-tenant subdomains', () => {
    expect(resolveTenantFromHostname('www.3s-export.com', '3s-export.com')).toBe('')
    expect(resolveTenantFromHostname('app.3s-export.com', '3s-export.com')).toBe('')
    expect(resolveTenantFromHostname('crm.3s-export.com', '3s-export.com')).toBe('')
    expect(resolveTenantFromHostname('dashboard.3s-export.com', '3s-export.com')).toBe('')
  })

  it('strips a port from the hostname before resolving', () => {
    expect(resolveTenantFromHostname('test0002.3s-export.com:5173', '3s-export.com')).toBe('test0002')
  })

  it('is case-insensitive', () => {
    expect(resolveTenantFromHostname('TEST0002.3S-EXPORT.COM', '3s-export.com')).toBe('test0002')
  })

  it('handles a nip.io style dev host with an embedded tenant', () => {
    expect(resolveTenantFromHostname('test0002.127.0.0.1.nip.io', '127.0.0.1.nip.io')).toBe('test0002')
  })
})

describe('resolveTenantId', () => {
  it('prefers an explicit tenant id over anything on the user', () => {
    expect(resolveTenantId({ tenant_id: 'from-user' }, 'explicit')).toBe('explicit')
  })

  it('falls back through user tenant field spellings in priority order', () => {
    expect(resolveTenantId({ tenantId: 'camel' })).toBe('camel')
    expect(resolveTenantId({ tenant_slug: 'slug' })).toBe('slug')
    expect(resolveTenantId({ tenant: { id: 'nested-id' } })).toBe('nested-id')
    expect(resolveTenantId({ company: { tenant_id: 'company-tenant' } })).toBe('company-tenant')
  })

  it('returns empty string when nothing resolves and there is no hostname to fall back to', () => {
    expect(resolveTenantId(null)).toBe('')
  })

  it('ignores object/null candidate values rather than stringifying them', () => {
    expect(resolveTenantId({ tenant_id: null, tenantId: undefined, tenant_slug: 'ok' })).toBe('ok')
  })
})

describe('requireTenantId', () => {
  it('returns the normalized tenant id when present', () => {
    expect(requireTenantId('  test0002  ')).toBe('test0002')
  })

  it('throws when the tenant id is empty', () => {
    expect(() => requireTenantId('')).toThrow('Tenant id is required for this request.')
    expect(() => requireTenantId(null)).toThrow()
  })
})
