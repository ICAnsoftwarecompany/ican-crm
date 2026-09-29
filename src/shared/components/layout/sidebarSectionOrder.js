export function applySidebarSectionOrder(sections, savedOrder) {
  const fixedSections = sections.filter((section) => section.hideLabel)
  const movableSections = sections.filter((section) => !section.hideLabel)
  const movableById = new Map(movableSections.map((section) => [section.id, section]))
  const orderedIds = normalizeSidebarSectionOrder(savedOrder, movableSections.map((section) => section.id))

  return [...fixedSections, ...orderedIds.map((id) => movableById.get(id)).filter(Boolean)]
}

export function normalizeSidebarSectionOrder(savedOrder, availableIds) {
  const available = new Set(availableIds)
  const persisted = Array.isArray(savedOrder)
    ? savedOrder.filter((id, index) => available.has(id) && savedOrder.indexOf(id) === index)
    : []

  return [...persisted, ...availableIds.filter((id) => !persisted.includes(id))]
}

export function moveSidebarSection(savedOrder, draggedId, targetId, availableIds) {
  const order = normalizeSidebarSectionOrder(savedOrder, availableIds)
  const fromIndex = order.indexOf(draggedId)
  const targetIndex = order.indexOf(targetId)

  if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) return order

  const next = [...order]
  const [dragged] = next.splice(fromIndex, 1)
  next.splice(targetIndex, 0, dragged)
  return next
}
