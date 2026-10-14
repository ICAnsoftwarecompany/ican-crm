/**
 * The chain root → … → chosen category, with what each level holds (2026-10-15). Pure, tested.
 * Used under the category select so the user sees the parent, grandparent… and their details.
 */
import { getAdditionalFieldNames } from '../../components/common/AdditionalDataFields'
import { getCategoryChildren, getCategoryLabel } from '../../utils/categoryTree'

/** Categories from the tree (root first) down to the one with this id; [] when not found. */
export function categoryPath(tree = [], id) {
  if (id === '' || id === null || id === undefined) return []
  const walk = (nodes, trail) => {
    for (const node of nodes) {
      const next = [...trail, node]
      if (String(node.id) === String(id)) return next
      const found = walk(getCategoryChildren(node), next)
      if (found) return found
    }
    return null
  }
  return walk(tree, []) || []
}

/** What the details card shows for one level. */
export function describeCategory(category) {
  const children = getCategoryChildren(category)
  return {
    id: category.id,
    name: getCategoryLabel(category),
    description: category.desc || category.description || '',
    active: Number(category.status ?? category.active ?? 1) === 1,
    fields: getAdditionalFieldNames(category.data),
    childrenCount: children.length,
    image: typeof category.image === 'string' ? category.image : category.image_url || '',
  }
}

/** Additional-data field names of the whole path (parents first, no duplicates) — suggested for the product. */
export function inheritedFieldNames(path = []) {
  return [...new Set(path.flatMap((category) => getAdditionalFieldNames(category.data)))]
}
