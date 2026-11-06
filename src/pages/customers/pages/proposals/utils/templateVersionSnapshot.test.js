import { describe, expect, it } from 'vitest'
import { createProposalContentFromTemplate, getCurrentTemplateVersion, getTemplateVersions } from './templateVersionSnapshot'
import { normalizeBuilderContent, moveItem } from './proposalBuilderContent'

const translate = key => key
const templateContent = {
  schema_version: 1,
  title: 'Reusable template',
  design: { primary_color: '#123456' },
  settings: { currency: 'EGP' },
  sections: [
    { id: 'section-1', title: 'Introduction', description: 'Keep this', is_visible: false, blocks: [
      { id: 'cover-1', type: 'cover', data: { title: 'Template cover' }, styles: {} },
      { id: 'text-1', type: 'text', data: { content: 'Reusable copy' }, styles: {} },
    ] },
    { id: 'section-2', title: 'Empty section', description: 'No blocks yet', blocks: [] },
  ],
}

describe('template version isolation', () => {
  it('resolves the explicitly current version, not simply the first version', () => {
    const template = { current_version_id: 2, versions: [{ id: 1 }, { id: 2 }, { id: 3 }] }
    expect(getCurrentTemplateVersion(template)?.id).toBe(2)
    expect(getTemplateVersions(template)).toHaveLength(3)
  })

  it('supports a current-version-only response and serialized current flags', () => {
    expect(getCurrentTemplateVersion({ current_version: { id: 8, content: templateContent } })?.id).toBe(8)
    expect(getCurrentTemplateVersion({ versions: [{ id: 9, is_current: '1' }] })?.id).toBe(9)
    expect(getCurrentTemplateVersion({ versions: [{ id: 9 }] })).toBeNull()
  })

  it('copies saved design and section order without mutating the template', () => {
    const original = structuredClone(templateContent)
    const version = { id: 4, content: templateContent }
    const proposal = createProposalContentFromTemplate(version, { title: 'Quote A' }, { id: 20, name: 'Client A' }, translate)
    expect(proposal.title).toBe('Quote A')
    expect(proposal.design.primary_color).toBe('#123456')
    expect(proposal.settings.currency).toBe('EGP')
    expect(proposal.customer.name).toBe('Client A')
    expect(proposal.sections.map(section => section.title)).toEqual(['Introduction', 'Empty section'])
    expect(proposal.sections[0].is_visible).toBe(false)
    expect(proposal.sections[1].blocks).toEqual([])
    expect(proposal.sections[0].id).not.toBe('section-1')
    expect(proposal.sections[0].blocks[1].id).not.toBe('text-1')
    proposal.sections[0].blocks[1].data.content = 'Customer edit'
    expect(templateContent).toEqual(original)
  })

  it('rejects missing or invalid template version content', () => {
    expect(createProposalContentFromTemplate({ content: '{broken' }, {}, null, translate)).toBeNull()
    expect(createProposalContentFromTemplate({ content: { sections: [] } }, {}, null, translate)).toBeNull()
    expect(createProposalContentFromTemplate({ id: 1 }, {}, null, translate)).toBeNull()
  })

  it('preserves empty sections and custom metadata during reload', () => {
    const restored = normalizeBuilderContent(JSON.stringify(templateContent), {}, translate)
    expect(restored.sections[1].blocks).toEqual([])
    expect(restored.sections[1].description).toBe('No blocks yet')
    expect(restored.sections[0].is_visible).toBe(false)
  })

  it('reorders without mutating the original array', () => {
    const sections = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const moved = moveItem(sections, 'c', 'a')
    expect(moved.map(x => x.id)).toEqual(['c', 'a', 'b'])
    expect(sections.map(x => x.id)).toEqual(['a', 'b', 'c'])
  })
})
