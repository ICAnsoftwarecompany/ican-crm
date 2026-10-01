import httpClient from '../../../services/httpClient'

/**
 * Auth endpoints.
 *
 * LIVE today: login, refreshSession, logout (unchanged contract).
 *
 * PROPOSED (backend not built yet — UI is ready behind VITE_AUTH_METHODS):
 * getGoogleAuthUrl, completeGoogleSignIn, getBiometricOptions,
 * verifyBiometric, signInWithPin. The exact contract is documented in
 * docs/auth-login-methods.md; adjust these functions only, never the
 * components, if the backend chooses different paths or field names.
 */
export const authApi = {
  login: async ({ login, password }) => {
    const formData = new FormData()
    formData.append('login', login)
    formData.append('password', password)

    // skipSessionRefresh: a wrong password answers 401, which must show a
    // login error — not open the global "session expiring" modal.
    const res = await httpClient.post('/api/tenant/auth/signin', formData, {
      skipSessionRefresh: true,
    })
    return res.data
  },

  refreshSession: async () => {
    const res = await httpClient.post('/api/tenant/auth/refresh', undefined, {
      skipSessionRefresh: true,
    })
    return res.data
  },

  logout: async () => {
    const res = await httpClient.get('/api/tenant/auth/logout')
    return res.data
  },

  // ── Google (proposed) ────────────────────────────────────────────────
  /** @returns {Promise<{ url: string }>} Google consent URL built by the backend. */
  getGoogleAuthUrl: async ({ redirectUri, state }) => {
    const res = await httpClient.get('/api/tenant/auth/google/url', {
      params: { redirect_uri: redirectUri, state },
      skipSessionRefresh: true,
    })
    return res.data
  },

  /** Exchanges the one-time Google `code` for our bearer token. */
  completeGoogleSignIn: async ({ code, redirectUri }) => {
    const res = await httpClient.post(
      '/api/tenant/auth/google/callback',
      { code, redirect_uri: redirectUri },
      { skipSessionRefresh: true }
    )
    return res.data
  },

  // ── Face ID / Fingerprint via WebAuthn (proposed) ───────────────────
  /** @returns {Promise<{ publicKey: object }>} WebAuthn request options (base64url fields). */
  getBiometricOptions: async ({ login }) => {
    const res = await httpClient.post(
      '/api/tenant/auth/webauthn/options',
      { login },
      { skipSessionRefresh: true }
    )
    return res.data
  },

  verifyBiometric: async ({ login, credential }) => {
    const res = await httpClient.post(
      '/api/tenant/auth/webauthn/verify',
      { login, credential },
      { skipSessionRefresh: true }
    )
    return res.data
  },

  // ── PIN fallback (proposed) ─────────────────────────────────────────
  signInWithPin: async ({ login, pin }) => {
    const res = await httpClient.post(
      '/api/tenant/auth/pin/signin',
      { login, pin },
      { skipSessionRefresh: true }
    )
    return res.data
  },
}
