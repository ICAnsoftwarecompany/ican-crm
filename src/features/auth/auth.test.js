import { describe, expect, it } from 'vitest'
import { resolveLoginError } from './utils/loginError'
import { resolvePostLoginPath } from './utils/postLoginRedirect'
import { LOGIN_METHOD, resolveEnabledLoginMethods } from './constants/loginMethods'

const httpError = (status, data = {}, headers = {}) => ({ response: { status, data, headers } })

describe('resolveLoginError', () => {
  it('treats 401/422 as wrong credentials', () => {
    expect(resolveLoginError(httpError(401)).key).toBe('auth.errors.invalidCredentials')
    expect(resolveLoginError(httpError(422)).key).toBe('auth.errors.invalidCredentials')
  })

  it('separates a disabled account from a wrong password', () => {
    expect(resolveLoginError(httpError(403)).key).toBe('auth.errors.accountDisabled')
    expect(resolveLoginError(httpError(401, { code: 'user_inactive' })).key).toBe('auth.errors.accountDisabled')
  })

  it('reports rate limiting with the server wait time when given', () => {
    expect(resolveLoginError(httpError(429)).key).toBe('auth.errors.tooManyAttempts')
    expect(resolveLoginError(httpError(429, {}, { 'retry-after': '30' }))).toEqual({
      key: 'auth.errors.tooManyAttemptsWait',
      retryAfter: 30,
    })
  })

  it('reports server and network failures as such, not as bad credentials', () => {
    expect(resolveLoginError(httpError(500)).key).toBe('auth.errors.server')
    expect(resolveLoginError(httpError(503)).key).toBe('auth.errors.server')
    expect(resolveLoginError(new Error('Network Error')).key).toMatch(/auth\.errors\.(network|offline)/)
  })

  it('reports a missing tenant', () => {
    expect(resolveLoginError(httpError(404)).key).toBe('auth.errors.tenantNotFound')
  })
})

describe('resolvePostLoginPath', () => {
  it('returns the page the user originally asked for', () => {
    expect(resolvePostLoginPath({ from: { pathname: '/lead/42', search: '?tab=notes', hash: '#n1' } })).toBe(
      '/lead/42?tab=notes#n1'
    )
  })

  it('falls back to the dashboard', () => {
    expect(resolvePostLoginPath(null)).toBe('/')
    expect(resolvePostLoginPath({})).toBe('/')
  })

  it('never redirects to /login or off-site', () => {
    expect(resolvePostLoginPath({ from: { pathname: '/login' } })).toBe('/')
    expect(resolvePostLoginPath({ from: { pathname: '//evil.example' } })).toBe('/')
    expect(resolvePostLoginPath({ from: { pathname: 'https://evil.example' } })).toBe('/')
  })
})

describe('resolveEnabledLoginMethods', () => {
  it('always includes password', () => {
    expect([...resolveEnabledLoginMethods('')]).toEqual([LOGIN_METHOD.PASSWORD])
  })

  it('reads the comma list and ignores unknown ids', () => {
    const methods = resolveEnabledLoginMethods(' google , FINGERPRINT, telepathy ')
    expect(methods.has(LOGIN_METHOD.GOOGLE)).toBe(true)
    expect(methods.has(LOGIN_METHOD.FINGERPRINT)).toBe(true)
    expect(methods.has('telepathy')).toBe(false)
    expect(methods.has(LOGIN_METHOD.FACE_ID)).toBe(false)
  })
})

describe('SHOWCASE_SLIDES', async () => {
  const { SHOWCASE_SLIDES } = await import('./constants/showcaseSlides')
  const ar = (await import('../../locales/ar/auth.js')).default
  const en = (await import('../../locales/en/auth.js')).default

  it('has unique ids and four points per slide', () => {
    const ids = SHOWCASE_SLIDES.map((slide) => slide.id)
    expect(new Set(ids).size).toBe(ids.length)
    SHOWCASE_SLIDES.forEach((slide) => expect(slide.points).toHaveLength(4))
  })

  it('has copy for every slide and point in both languages', () => {
    for (const locale of [ar, en]) {
      for (const slide of SHOWCASE_SLIDES) {
        const copy = locale.showcase.slides[slide.id]
        expect(copy?.area && copy?.title && copy?.subtitle).toBeTruthy()
        for (const point of slide.points) {
          expect(copy.points[point.id]?.title && copy.points[point.id]?.text).toBeTruthy()
        }
      }
    }
  })
})
