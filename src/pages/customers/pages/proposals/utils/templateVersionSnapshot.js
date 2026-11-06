import { createUid, normalizeBuilderContent } from './proposalBuilderContent'

export function getTemplateVersions(template) {
  const versions = template?.versions ?? template?.template_versions ?? template?.data?.versions ?? []
  return Array.isArray(versions) ? versions : []
}

export function getCurrentTemplateVersion(template) {
  const versions = getTemplateVersions(template)
  const currentId = template?.current_version_id ?? template?.current_version?.id
  return versions.find(version => String(version.id) === String(currentId))
    || versions.find(version => version.is_current === true || version.is_current === 1)
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
  const normalized = normalizeBuilderContent(raw, proposal, t)
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
