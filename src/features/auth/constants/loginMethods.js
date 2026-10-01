/**
 * Sign-in methods shown on the login page.
 *
 * Only `password` is live today. The others have their UI and request flow
 * ready, but the backend endpoints do not exist yet (see
 * docs/auth-login-methods.md). A method becomes clickable when its id is
 * listed in VITE_AUTH_METHODS, e.g.:
 *
 *   VITE_AUTH_METHODS=password,google,face_id,fingerprint
 *
 * Until then it renders as "coming soon". Enabling a method is therefore a
 * config change once the backend ships, not a UI change.
 */
export const LOGIN_METHOD = {
  PASSWORD: 'password',
  GOOGLE: 'google',
  FACE_ID: 'face_id',
  FINGERPRINT: 'fingerprint',
}

/** Methods that use the device biometric (WebAuthn) with a PIN fallback. */
export const BIOMETRIC_METHODS = [LOGIN_METHOD.FACE_ID, LOGIN_METHOD.FINGERPRINT]

/** Order of the alternative-method buttons under the password form. */
export const ALTERNATIVE_METHODS = [LOGIN_METHOD.GOOGLE, LOGIN_METHOD.FACE_ID, LOGIN_METHOD.FINGERPRINT]

export const PIN_LENGTH = 6

/**
 * @param {string} [raw] - comma-separated method ids (defaults to the env value).
 * @returns {Set<string>}
 */
export function resolveEnabledLoginMethods(raw = import.meta.env.VITE_AUTH_METHODS) {
  const ids = String(raw || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => Object.values(LOGIN_METHOD).includes(value))

  // Password is the baseline and can never be switched off from config.
  return new Set([LOGIN_METHOD.PASSWORD, ...ids])
}
