import { createPortalHttpClient } from '../../../services/portalHttpClient'
import { withServiceTransport } from '../../service/portal-transport'
import { usePortalSession } from '../store/portalSessionStore'

const client = createPortalHttpClient({
  getToken: () => usePortalSession.getState().token,
  onUnauthorized: () => usePortalSession.getState().clear(),
})

/** Portal HTTP: the portal client + the same mock switch as the Service area (module `portal`). */
export const portalHttp = {
  get: (url, config) => client.get(url, withServiceTransport('portal', config)),
  post: (url, data, config) => client.post(url, data, withServiceTransport('portal', config)),
  patch: (url, data, config) => client.patch(url, data, withServiceTransport('portal', config)),
}
export const unwrap = (response) => response.data?.data ?? response.data
