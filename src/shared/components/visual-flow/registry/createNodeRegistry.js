/**
 * Node registry factory. VisualFlow core NEVER hard-codes which node types
 * exist — every consumer builds (or composes) a registry and passes it in
 * as a prop. See docs "Registry" and "Node Package Architecture".
 *
 * @param {import('../types').VisualFlowNodeDefinition[]} [initialDefinitions]
 */
export function createNodeRegistry(initialDefinitions = []) {
  const definitions = new Map()

  function register(definitionOrList) {
    const list = Array.isArray(definitionOrList) ? definitionOrList : [definitionOrList]
    list.forEach((definition) => {
      if (!definition?.type) throw new Error('createNodeRegistry.register: definition.type is required')
      definitions.set(definition.type, definition)
    })
  }

  function unregister(type) {
    definitions.delete(type)
  }

  function get(type) {
    return definitions.get(type) || null
  }

  function has(type) {
    return definitions.has(type)
  }

  function getAll() {
    return Array.from(definitions.values())
  }

  function getByCategory(category) {
    return getAll().filter((definition) => definition.category === category)
  }

  register(initialDefinitions)

  return { register, unregister, get, has, getAll, getByCategory }
}

/**
 * Composes several registries (e.g. core + CRM + tasks + campaigns) into
 * one, exactly the `createWorkflowRegistry([coreNodes, crmNodes, ...])`
 * shape described in docs "Node Package Architecture" — this is how a
 * tenant's enabled modules determine which nodes it ends up with, without
 * VisualFlow knowing anything about subscriptions/packages.
 *
 * @param {ReturnType<typeof createNodeRegistry>[] | import('../types').VisualFlowNodeDefinition[][]} sources
 */
export function combineNodeRegistries(sources = []) {
  const combined = createNodeRegistry()
  sources.forEach((source) => {
    const definitions = typeof source?.getAll === 'function' ? source.getAll() : source
    combined.register(definitions || [])
  })
  return combined
}
