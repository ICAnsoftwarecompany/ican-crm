import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { serializeAssertion, toPublicKeyRequestOptions } from '../utils/webauthn'
import { requireToken } from './useLogin'
import { useCompleteSignIn } from './useCompleteSignIn'

const GOOGLE_STATE_KEY = 'ican-google-oauth-state'

function googleRedirectUri() {
  return `${window.location.origin}/login`
}

function randomState() {
  const bytes = new Uint8Array(16)
  window.crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Google sign-in, step 1: ask the backend for the consent URL and leave the
 * app. The `state` value is kept in sessionStorage and checked on return to
 * block forged callbacks (CSRF).
 */
export function useStartGoogleSignIn() {
  return useMutation({
    mutationFn: async () => {
      const state = randomState()
      window.sessionStorage.setItem(GOOGLE_STATE_KEY, state)
      const data = await authApi.getGoogleAuthUrl({ redirectUri: googleRedirectUri(), state })
      if (!data?.url) throw new Error('Missing Google auth URL')
      window.location.assign(data.url)
      return data
    },
  })
}

/**
 * Google sign-in, step 2: Google sends the user back to /login?code=…&state=…
 * and we exchange the one-time code for our token.
 */
export function useCompleteGoogleSignIn() {
  const completeSignIn = useCompleteSignIn()

  return useMutation({
    mutationFn: async ({ code, state }) => {
      const expected = window.sessionStorage.getItem(GOOGLE_STATE_KEY)
      window.sessionStorage.removeItem(GOOGLE_STATE_KEY)
      if (!expected || expected !== state) {
        const error = new Error('Google state mismatch')
        error.response = { status: 401, data: { code: 'oauth_state_mismatch' } }
        throw error
      }
      return requireToken(authApi.completeGoogleSignIn({ code, redirectUri: googleRedirectUri() }))
    },
    onSuccess: (data) => completeSignIn(data, data.user?.email),
  })
}

/** Face ID / fingerprint: WebAuthn challenge → device prompt → server verification. */
export function useBiometricLogin() {
  const completeSignIn = useCompleteSignIn()

  return useMutation({
    mutationFn: async ({ login }) => {
      const options = await authApi.getBiometricOptions({ login })
      const credential = await navigator.credentials.get({
        publicKey: toPublicKeyRequestOptions(options.publicKey || options),
      })
      if (!credential) throw new Error('No credential returned')
      return requireToken(authApi.verifyBiometric({ login, credential: serializeAssertion(credential) }))
    },
    onSuccess: (data, { login }) => completeSignIn(data, login),
  })
}

/** PIN fallback when the biometric prompt fails or is cancelled. */
export function usePinLogin() {
  const completeSignIn = useCompleteSignIn()

  return useMutation({
    mutationFn: ({ login, pin }) => requireToken(authApi.signInWithPin({ login, pin })),
    onSuccess: (data, { login }) => completeSignIn(data, login),
  })
}
