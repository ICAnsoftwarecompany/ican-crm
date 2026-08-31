export function getCategoryLabel(category) {
  return category?.name || category?.title || `Category #${category?.id || category?.category_id}`
}

export function getCategoryChildren(category) {
  if (Array.isArray(category?.children_recursive)) return category.children_recursive
  if (Array.isArray(category?.children)) return category.children
  return []
}

export function flattenCategoryTree(categories = [], depth = 0, parentLabels = []) {
  return categories.flatMap((category) => {
    const label = getCategoryLabel(category)
    const item = {
      ...category,
      _depth: depth,
      _pathLabel: [...parentLabels, label].join(' / '),
      _childrenCount: getCategoryChildren(category).length,
    }

    return [
      item,
      ...flattenCategoryTree(getCategoryChildren(category), depth + 1, [...parentLabels, label]),
    ]
  })
}

export function countCategoriesTree(categories = []) {
  return categories.reduce((total, category) => {
    return total + 1 + countCategoriesTree(getCategoryChildren(category))
  }, 0)
}

export function countActiveCategoriesTree(categories = []) {
  return categories.reduce((total, category) => {
    const activeCount = Number(category.active ?? category.status ?? 1) === 1 ? 1 : 0
    return total + activeCount + countActiveCategoriesTree(getCategoryChildren(category))
  }, 0)
}

export function filterCategoryTreeByType(categories = [], type = '') {
  if (!type) return categories

  return categories
    .map((category) => ({
      ...category,
      children_recursive: filterCategoryTreeByType(getCategoryChildren(category), type),
    }))
    .filter((category) => {
      const categoryType = category.type || 'product'
      return categoryType === type || getCategoryChildren(category).length > 0
    })
}
