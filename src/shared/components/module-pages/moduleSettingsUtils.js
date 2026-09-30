/** Picks the section to show: the requested id if it exists, else the first section. */
export function resolveActiveSectionId(sections = [], requestedId) {
  if (!sections.length) return null
  if (requestedId && sections.some((section) => section.id === requestedId)) return requestedId
  return sections[0].id
}
