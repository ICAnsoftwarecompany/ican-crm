import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useCompleteSignIn } from './useCompleteSignIn'

/** Rejects responses that "succeed" without a token, so they surface as an error. */
export async function requireToken(promise) {
  const data = await promise
  if (!data?.token) {
    const error = new Error('Missing token in sign-in response')
    error.response = { status: 500, data }
    throw error
  }
  return data
}

/**
 * Username + password sign-in.
 * Errors are not toasted here: the form shows them inline (see
 * resolveLoginError) so they stay visible until the user acts.
 */
export function useLogin() {
  const completeSignIn = useCompleteSignIn()

  return useMutation({
    mutationFn: (credentials) => requireToken(authApi.login(credentials)),
    onSuccess: (data, credentials) => completeSignIn(data, credentials.login),
  })
}
