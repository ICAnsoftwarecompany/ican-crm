import { proposalTemplatesApi } from '../../../../../features/proposals/api/proposalTemplatesApi'

const numericId = value => /^\d+$/.test(String(value ?? ''))
// API methods already return res.data. A saved block also has a nested `data`
// field containing its editable content; that field is NOT a response envelope.
const requireId = (response, type) => {
  const candidates = [response, response?.data, response?.data?.data, response?.[type], response?.data?.[type]]
  const id = candidates.flatMap(entity => [entity?.id, entity?.[`${type}_id`]]).find(numericId)
  if (!id) {
    const keys = candidates.filter(entity => entity && typeof entity === 'object')
      .map(entity => Object.keys(entity).join(', ')).join(' | ')
    throw new Error(`Create ${type} returned no numeric ID (response fields: ${keys || 'none'}). The record may already exist; reload before retrying.`)
  }
  return id
}

/**
 * Synchronize a visual draft with the persisted version tree.
 * The returned content contains the server IDs and must replace the local draft
 * before allowing further edits or retries.
 */
export async function persistTemplateSections(versionId, content, onProgress = () => {}, previous = []) {
  const next = structuredClone(content)
  const stage = async (label, operation) => {
    try { return await operation() } catch (error) {
      throw new Error(`${label}: ${error?.response?.data?.message || error?.message || 'Request failed'}`)
    }
  }
  const savedSections = new Set()
  for (let i = 0; i < next.sections.length; i += 1) {
    const section = next.sections[i]
    const sectionPayload = {
      name: section.title || section.name || 'Section',
      description: section.description || null,
      settings: section.settings || {},
      styles: section.styles || {},
      sort_order: i + 1,
      is_visible: section.is_visible ?? true,
    }
    if (!numericId(section.id)) {
      section.id = await stage(`Create section ${i + 1}`, async () => requireId(await proposalTemplatesApi.createVersionSection(versionId, sectionPayload), 'section'))
      onProgress(structuredClone(next))
    } else {
      await stage(`Update section ${section.id}`, () => proposalTemplatesApi.updateSection(section.id, sectionPayload))
    }
    savedSections.add(String(section.id))
    const savedBlocks = new Set()
    for (let j = 0; j < section.blocks.length; j += 1) {
      const block = section.blocks[j]
      const blockPayload = {
        type: block.type,
        name: block.name || block.type,
        data: block.data || {},
        styles: block.styles || {},
        responsive: block.responsive || {},
        sort_order: j + 1,
        is_visible: block.is_visible ?? true,
      }
      if (!numericId(block.id)) {
        block.id = await stage(`Create block ${j + 1} in section ${section.id}`, async () => requireId(await proposalTemplatesApi.createSectionBlock(section.id, blockPayload), 'block'))
        onProgress(next)
      } else {
        await stage(`Update block ${block.id}`, () => proposalTemplatesApi.updateBlock(block.id, blockPayload))
      }
      savedBlocks.add(String(block.id))
    }
    const prior = previous.find(item => String(item.id) === String(section.id))
    for (const block of prior?.blocks || []) {
      if (numericId(block.id) && !savedBlocks.has(String(block.id))) await stage(`Delete block ${block.id}`, () => proposalTemplatesApi.deleteBlock(block.id))
    }
    if (section.blocks.length) {
      await stage(`Reorder blocks in section ${section.id}`, () => proposalTemplatesApi.reorderSectionBlocks(section.id, section.blocks.map(block => block.id)))
    }
    onProgress(next)
  }
  for (const section of previous) {
    if (numericId(section.id) && !savedSections.has(String(section.id))) await stage(`Delete section ${section.id}`, () => proposalTemplatesApi.deleteSection(section.id))
  }
  if (next.sections.length) {
    await stage(`Reorder sections in version ${versionId}`, () => proposalTemplatesApi.reorderVersionSections(versionId, next.sections.map(section => section.id)))
  }
  return next
}
