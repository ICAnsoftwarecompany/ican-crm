/**
 * Minimal WebAuthn helpers for Face ID / fingerprint sign-in.
 *
 * On the web, Face ID, Touch ID, Windows Hello and Android fingerprint are all
 * the same API: a "platform authenticator" behind navigator.credentials.get().
 * The operating system decides which sensor to show; our two buttons only
 * set the user's expectation and the icon.
 */

export function isWebAuthnSupported() {
  return typeof window !== 'undefined' && Boolean(window.PublicKeyCredential) && Boolean(navigator.credentials?.get)
}

/** True when this device has a built-in biometric/PIN authenticator. */
export async function isPlatformAuthenticatorAvailable() {
  if (!isWebAuthnSupported()) return false
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

export function base64UrlToBuffer(value) {
  const base64 = String(value).replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes.buffer
}

export function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Converts the server's JSON request options (base64url strings) into what the browser expects. */
export function toPublicKeyRequestOptions(options) {
  return {
    ...options,
    challenge: base64UrlToBuffer(options.challenge),
    userVerification: options.userVerification || 'required',
    allowCredentials: (options.allowCredentials || []).map((credential) => ({
      ...credential,
      id: base64UrlToBuffer(credential.id),
    })),
  }
}

/** Serializes the browser's assertion so it can be posted as JSON. */
export function serializeAssertion(credential) {
  const response = credential.response
  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      authenticatorData: bufferToBase64Url(response.authenticatorData),
      signature: bufferToBase64Url(response.signature),
      userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
    },
  }
}
