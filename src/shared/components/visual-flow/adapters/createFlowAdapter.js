/**
 * Wraps a `{fromApi, toApi}` pair into a stable adapter object. This is
 * the ONLY sanctioned place backend response shapes may leak into —
 * VisualFlow's own model (`VisualFlowModel`, see types.js) never changes
 * shape to accommodate a particular backend. See docs "Adapter Layer".
 *
 * @param {import('../types').VisualFlowAdapter} config
 * @returns {import('../types').VisualFlowAdapter}
 */
export function createFlowAdapter({ fromApi, toApi }) {
  if (typeof fromApi !== 'function' || typeof toApi !== 'function') {
    throw new Error('createFlowAdapter: both fromApi and toApi must be functions')
  }
  return { fromApi, toApi }
}

/** Identity adapter for a feature whose API already returns the canonical VisualFlowModel shape. */
export const identityFlowAdapter = createFlowAdapter({
  fromApi: (apiData) => apiData,
  toApi: (flow) => flow,
})
