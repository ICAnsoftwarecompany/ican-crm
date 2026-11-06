import { createUid, normalizeBuilderContent } from './proposalBuilderContent'

export function getTemplateVersions(template) {
  const versions = template?.versions ?? template?.template_versions ?? template?.data?.versions ?? []
  if (Array.isArray(versions) && versions.length) return versions
  return template?.current_version?.id ? [template.current_version] : []
}

export function getCurrentTemplateVersion(template) {
  const versions = getTemplateVersions(template)
  const currentId = template?.current_version_id ?? template?.current_version?.id
  return versions.find(version => currentId != null && String(version.id) === String(currentId))
    || versions.find(version => version.is_current === true || version.is_current === 1 || version.is_current === '1')
    || null
}

export function getTemplateVersionContent(version) {
  return version?.content ?? version?.builder_content ?? version?.builder?.content ?? version?.builder ?? null
}

function freshIds(content) {
  return {
    ...content,
    sections: (content.sections || []).map(section => ({
      ...section,
      id: createUid('section'),
      blocks: (section.blocks || []).map(block => ({ ...block, id: createUid(block.type || 'block') })),
    })),
  }
}

/**
 * A customer proposal owns a snapshot of the chosen template version.
 * Template changes must never mutate previously created proposal versions.
 */
export function createProposalContentFromTemplate(templateVersion, proposal, customer, t) {
  const raw = getTemplateVersionContent(templateVersion)
  if (!raw) return null
  let parsed = raw
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw) } catch { return null }
  }
  if (!Array.isArray(parsed?.sections) || !parsed.sections.length) return null
  const normalized = normalizeBuilderContent(parsed, proposal, t)
  const customerName = customer?.name || customer?.full_name || proposal?.metadata?.customer_name || ''
  const sections = freshIds(normalized).sections.map(section => ({
    ...section,
    blocks: section.blocks.map(block => (
      block.type === 'cover'
        ? { ...block, data: { ...block.data, title: proposal.title || block.data?.title } }
        : block
    )),
  }))
  return {
    ...normalized,
    title: proposal.title || normalized.title,
    customer: {
      id: customer?.id || proposal?.metadata?.customer_id || null,
      name: customerName,
      email: customer?.email || proposal?.metadata?.customer_email || '',
      phone: customer?.phone || proposal?.metadata?.customer_phone || '',
      company: customer?.company || proposal?.metadata?.company || '',
    },
    sections,
  }
}

/**
 * Compare persisted builder data with the submitted snapshot, ignoring
 * object key order but retaining section/block array order.
 */
function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]))
  }
  return value
}

export function verifySavedTemplateContent(saved, submitted) {
  const raw = getTemplateVersionContent(saved)
  if (raw == null) return false
  let content = raw
  if (typeof content === 'string') {
    try { content = JSON.parse(content) } catch { return false }
  }
  if (!Array.isArray(content?.sections) || !Array.isArray(submitted?.sections)) return false
  const shape = value => ({
    sections: value.sections.map(section => ({
      id: String(section.id),
      title: section.title,
      description: section.description || '',
      is_visible: section.is_visible !== false && section.is_visible !== 0,
      blocks: (section.blocks || []).map(block => ({
        id: String(block.id),
        type: block.type,
        name: block.name,
        is_visible: block.is_visible !== false && block.is_visible !== 0,
        data: block.data || {},
        styles: block.styles || {},
      })),
    })),
    settings: value.settings || {},
    design: value.design || {},
  })
  return JSON.stringify(stable(shape(content))) === JSON.stringify(stable(shape(submitted)))
}
