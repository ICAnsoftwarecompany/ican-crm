/**
 * Mirrors visual-flow's createNodeRegistry pattern: the Calendar engine
 * never hard-codes which event sources exist (Tasks/Meetings/Calls today,
 * possibly Opportunities later) — the consuming feature builds a registry
 * and passes it in as a prop.
 *
 * @typedef {Object} CalendarEventSource
 * @property {string} id
 * @property {string} labelKey - i18next key for the sidebar toggle label.
 * @property {string} colorVar - CSS variable name (e.g. '--calendar-tasks').
 */
export function createEventSourceRegistry(initialSources = []) {
  const sources = new Map()

  function register(sourceOrList) {
    const list = Array.isArray(sourceOrList) ? sourceOrList : [sourceOrList]
    list.forEach((source) => {
      if (!source?.id) throw new Error('createEventSourceRegistry.register: source.id is required')
      sources.set(source.id, source)
    })
  }

  function get(id) {
    return sources.get(id) || null
  }

  function getAll() {
    return Array.from(sources.values())
  }

  register(initialSources)

  return { register, get, getAll }
}
