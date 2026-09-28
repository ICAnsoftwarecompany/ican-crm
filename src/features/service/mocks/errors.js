/**
 * Throw from a mock handler to return an HTTP error with the backend's
 * unified error shape (docs/customer-service/SERVICE-MASTER-SPEC.md §51.2).
 *
 *   throw new MockHttpError(409, 'CONFLICT_VERSION', 'Record was changed by someone else')
 */
export class MockHttpError extends Error {
  /**
   * @param {number} status
   * @param {string} code - Stable backend error code, e.g. CASE_TRANSITION_NOT_ALLOWED.
   * @param {string} [message]
   * @param {Record<string, string[]>} [errors] - Field errors.
   */
  constructor(status, code, message = code, errors = {}) {
    super(message)
    this.name = 'MockHttpError'
    this.status = status
    this.code = code
    this.errors = errors
  }

  toBody(requestId) {
    return {
      success: false,
      code: this.code,
      message: this.message,
      errors: this.errors,
      meta: { request_id: requestId },
    }
  }
}

export const notFound = (what = 'Resource') => new MockHttpError(404, 'NOT_FOUND', `${what} not found`)
