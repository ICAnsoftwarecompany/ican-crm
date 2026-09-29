/**
 * Turn a Service API error (unified backend shape, spec §51.2) into copy.
 * Known codes have translations under `service.errors.<CODE>`; anything else
 * falls back to the generic message.
 *
 * @param {unknown} error
 * @param {(key: string, options?: object) => string} t
 */
export function getServiceErrorMessage(error, t) {
  const body = /** @type {any} */ (error)?.response?.data
  const code = body?.code
  if (code) {
    return t(`service.errors.${code}`, { defaultValue: t('service.errors.generic') })
  }
  return t('service.errors.generic')
}

/** Field errors `{ field: ['required'] }` from a 422 response. */
export function getServiceFieldErrors(error) {
  return /** @type {any} */ (error)?.response?.data?.errors || {}
}
