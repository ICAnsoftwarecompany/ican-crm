import { AxiosError } from 'axios'
import { findRoute } from './router'
import { MockHttpError } from './errors'
import { mockRoutes } from './handlers'

const DEFAULT_LATENCY_MS = 250

function parseBody(data) {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

function buildResponse(config, status, data) {
  return {
    data,
    status,
    statusText: String(status),
    headers: { 'x-service-mock': 'true' },
    config,
    request: { mocked: true },
  }
}

function buildError(config, status, body, message) {
  const response = buildResponse(config, status, body)
  const code = status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST
  return new AxiosError(message, code, config, response.request, response)
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Axios adapter that serves Service API calls from mock handlers.
 * Handlers return `{ data, meta }` (the response body) or `{ status, body }`
 * for a custom status, and throw MockHttpError for failures.
 *
 * @param {import('axios').InternalAxiosRequestConfig} config
 * @param {{ routes?: import('./router').MockRoute[], latency?: number }} [options]
 */
export async function mockAdapter(config, { routes = mockRoutes, latency = DEFAULT_LATENCY_MS } = {}) {
  const method = (config.method || 'get').toUpperCase()
  const requestId = `mock-${Date.now().toString(36)}`
  const match = findRoute(routes, method, config.url || '')

  if (latency > 0) await wait(latency)

  if (!match) {
    const error = new MockHttpError(404, 'MOCK_ROUTE_NOT_FOUND', `No mock handler for ${method} ${config.url}`)
    throw buildError(config, 404, error.toBody(requestId), error.message)
  }

  try {
    const result = await match.route.handler({
      params: match.params,
      query: { ...(config.params || {}) },
      body: parseBody(config.data),
      headers: { ...(config.headers || {}) },
    })
    if (result && typeof result === 'object' && 'status' in result && 'body' in result) {
      return buildResponse(config, result.status, result.body)
    }
    return buildResponse(config, 200, result)
  } catch (error) {
    if (error instanceof MockHttpError) {
      throw buildError(config, error.status, error.toBody(requestId), error.message)
    }
    throw buildError(config, 500, new MockHttpError(500, 'MOCK_HANDLER_FAILED', error?.message).toBody(requestId), error?.message)
  }
}
