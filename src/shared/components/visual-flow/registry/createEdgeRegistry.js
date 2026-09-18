/**
 * Edge registry factory — same shape/philosophy as createNodeRegistry.js,
 * intentionally smaller since edge TYPES vary far less than node types
 * across features (default/conditional/animated/execution cover nearly
 * every real use case).
 *
 * @param {import('../types').VisualFlowEdgeDefinition[]} [initialDefinitions]
 */
export function createEdgeRegistry(initialDefinitions = []) {
  const definitions = new Map()

  function register(definitionOrList) {
    const list = Array.isArray(definitionOrList) ? definitionOrList : [definitionOrList]
    list.forEach((definition) => {
      if (!definition?.type) throw new Error('createEdgeRegistry.register: definition.type is required')
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

  register(initialDefinitions)

  return { register, unregister, get, has, getAll }
}

export function combineEdgeRegistries(sources = []) {
  const combined = createEdgeRegistry()
  sources.forEach((source) => {
    const definitions = typeof source?.getAll === 'function' ? source.getAll() : source
    combined.register(definitions || [])
  })
  return combined
}
