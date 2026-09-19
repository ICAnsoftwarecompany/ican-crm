import { DEFAULT_COMPANY_INFO, DEFAULT_PROPOSAL_DESIGN, DEFAULT_PROPOSAL_SETTINGS } from '../constants/proposalBuilderDefaults'
import { getBlockLabel } from '../constants/proposalBlockTypes'

export function createUid(prefix = 'item') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function createDefaultBlock(type, seed = {}, t) {
  const id = seed.id || createUid(type)
  const d = (key) => (t ? t(`proposals.builder.defaults.${key}`) : key)

  const defaults = {
    cover: {
      name: getBlockLabel('cover', t),
      data: { eyebrow: d('coverEyebrow'), title: d('coverTitle'), subtitle: d('coverSubtitle'), image_url: '' },
      styles: { align: 'center', background: '#F0FDFF' },
    },
    heading: {
      name: getBlockLabel('heading', t),
      data: { text: d('headingText'), level: 'h2' },
      styles: { align: 'start', color: DEFAULT_PROPOSAL_DESIGN.primary_color },
    },
    text: {
      name: getBlockLabel('text', t),
      data: { content: d('textContent') },
      styles: { align: 'start' },
    },
    image: {
      name: getBlockLabel('image', t),
      data: { url: '', caption: '' },
      styles: { fit: 'cover' },
    },
    button: {
      name: getBlockLabel('button', t),
      data: { label: d('buttonLabel'), url: '' },
      styles: { variant: 'primary' },
    },
    divider: { name: getBlockLabel('divider', t), data: {}, styles: {} },
    spacer: { name: getBlockLabel('spacer', t), data: { height: 24 }, styles: {} },
    customer_info: {
      name: getBlockLabel('customer_info', t),
      data: { show_email: true, show_phone: true, show_company: true },
      styles: {},
    },
    company_info: {
      name: getBlockLabel('company_info', t),
      data: DEFAULT_COMPANY_INFO,
      styles: {},
    },
    products: { name: getBlockLabel('products', t), data: { title: d('productsTitle') }, styles: {} },
    pricing: { name: getBlockLabel('pricing', t), data: { title: d('pricingTitle') }, styles: {} },
    terms: {
      name: getBlockLabel('terms', t),
      data: { content: d('termsContent') },
      styles: {},
    },
    signature: {
      name: getBlockLabel('signature', t),
      data: { signer_name: '', signer_title: '', line_label: d('signatureLineLabel') },
      styles: {},
    },
    page_break: { name: getBlockLabel('page_break', t), data: { label: d('pageBreakLabel') }, styles: {} },
    video: { name: getBlockLabel('video', t), data: { url: '', title: d('videoTitle') }, styles: {} },
    custom: { name: getBlockLabel('custom', t), data: { label: d('customLabel'), value: '' }, styles: {} },
    link: { name: getBlockLabel('link', t), data: { label: d('linkLabel'), url: '' }, styles: {} },
  }

  return {
    id,
    type,
    is_visible: seed.is_visible ?? true,
    ...(defaults[type] || defaults.text),
    ...seed,
    data: { ...(defaults[type]?.data || {}), ...(seed.data || {}) },
    styles: { ...(defaults[type]?.styles || {}), ...(seed.styles || {}) },
  }
}

export function createDefaultSection(seed = {}, t) {
  return {
    id: seed.id || createUid('section'),
    title: seed.title || (t ? t('proposals.builder.defaults.newSectionTitle') : 'New Section'),
    description: seed.description || '',
    is_visible: seed.is_visible ?? true,
    blocks: seed.blocks || [createDefaultBlock('heading', {}, t), createDefaultBlock('text', {}, t)],
  }
}

export function createDefaultBuilderContent(proposal = {}, customer = null, t) {
  const d = (key) => (t ? t(`proposals.builder.defaults.${key}`) : key)
  const customerName = customer?.name || proposal?.metadata?.customer_name || proposal?.metadata?.client_name || (t ? t('customers.table.theCustomer') : 'the customer')
  return {
    schema_version: 1,
    title: proposal?.title || d('newProposalTitle'),
    settings: DEFAULT_PROPOSAL_SETTINGS,
    design: DEFAULT_PROPOSAL_DESIGN,
    customer: customer || proposal?.metadata?.customer || {
      id: proposal?.metadata?.customer_id || null,
      name: customerName,
      email: proposal?.metadata?.customer_email || '',
      phone: proposal?.metadata?.customer_phone || '',
      company: proposal?.metadata?.company || '',
    },
    sections: [
      createDefaultSection({
        title: d('coverSectionTitle'),
        blocks: [
          createDefaultBlock('cover', {
            data: {
              eyebrow: d('coverEyebrow'),
              title: proposal?.title || (t ? t('proposals.builder.defaults.customTitleFor', { name: customerName }) : `Custom proposal for ${customerName}`),
              subtitle: proposal?.description || d('defaultDescription'),
              image_url: '',
            },
          }, t),
          createDefaultBlock('customer_info', {}, t),
        ],
      }, t),
      createDefaultSection({
        title: d('scopeSectionTitle'),
        blocks: [
          createDefaultBlock('heading', { data: { text: d('scopeSectionTitle'), level: 'h2' } }, t),
          createDefaultBlock('text', { data: { content: d('scopeText') } }, t),
          createDefaultBlock('products', {}, t),
        ],
      }, t),
      createDefaultSection({
        title: d('pricingTermsSectionTitle'),
        blocks: [
          createDefaultBlock('pricing', {}, t),
          createDefaultBlock('terms', {}, t),
          createDefaultBlock('signature', {}, t),
        ],
      }, t),
    ],
  }
}

function normalizeOldSection(section, index, t) {
  const sectionFallback = t ? t('proposals.builder.defaults.sectionFallback', { index: index + 1 }) : `Section ${index + 1}`

  if (section?.blocks?.length) {
    return {
      id: String(section.id || createUid(`section_${index}`)),
      title: section.title || section.name || sectionFallback,
      description: section.description || '',
      is_visible: section.is_visible ?? true,
      blocks: section.blocks.map((block, blockIndex) => createDefaultBlock(block.type || 'text', {
        ...block,
        id: String(block.id || createUid(`block_${index}_${blockIndex}`)),
      }, t)),
    }
  }

  return createDefaultSection({
    id: String(section?.id || createUid(`section_${index}`)),
    title: section?.title || section?.name || sectionFallback,
    blocks: [
      createDefaultBlock('heading', { data: { text: section?.title || section?.name || sectionFallback } }, t),
      createDefaultBlock('text', { data: { content: section?.content || section?.description || '' } }, t),
    ],
  }, t)
}

export function normalizeBuilderContent(rawContent, proposal = {}, t) {
  if (!rawContent) return createDefaultBuilderContent(proposal, null, t)

  let content = rawContent
  if (typeof rawContent === 'string') {
    try {
      content = JSON.parse(rawContent)
    } catch (_error) {
      return createDefaultBuilderContent(proposal, null, t)
    }
  }

  const sections = Array.isArray(content?.sections) && content.sections.length
    ? content.sections.map((section, index) => normalizeOldSection(section, index, t))
    : createDefaultBuilderContent(proposal, null, t).sections

  return {
    schema_version: content?.schema_version || 1,
    title: content?.title || proposal?.title || (t ? t('proposals.builder.defaults.coverEyebrow') : 'Price Quote'),
    settings: { ...DEFAULT_PROPOSAL_SETTINGS, ...(content?.settings || {}) },
    design: { ...DEFAULT_PROPOSAL_DESIGN, ...(content?.design || {}) },
    customer: content?.customer || proposal?.metadata?.customer || {
      id: proposal?.metadata?.customer_id || null,
      name: proposal?.metadata?.customer_name || proposal?.metadata?.client_name || '',
      email: proposal?.metadata?.customer_email || '',
      phone: proposal?.metadata?.customer_phone || '',
      company: proposal?.metadata?.company || '',
    },
    sections,
  }
}

export function moveItem(list, activeId, overId) {
  const oldIndex = list.findIndex((item) => item.id === activeId)
  const newIndex = list.findIndex((item) => item.id === overId)
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return list
  const next = [...list]
  const [moved] = next.splice(oldIndex, 1)
  next.splice(newIndex, 0, moved)
  return next
}

export function buildVersionPayload(version, proposal, content, overrides = {}) {
  const subtotal = Number(overrides.subtotal ?? version?.subtotal ?? 0) || 0
  const discount = Number(overrides.discount ?? version?.discount ?? 0) || 0
  const tax = Number(overrides.tax ?? version?.tax ?? 0) || 0
  const total = Number(overrides.total ?? version?.total ?? Math.max(subtotal - discount + tax, 0)) || 0

  return {
    name: overrides.name || version?.name || 'Version 1',
    change_note: overrides.change_note ?? version?.change_note ?? 'Visual builder update',
    template_id: Number(overrides.template_id || version?.template_id || proposal?.template_id) || undefined,
    content,
    settings: content?.settings || DEFAULT_PROPOSAL_SETTINGS,
    design: content?.design || DEFAULT_PROPOSAL_DESIGN,
    subtotal,
    discount,
    tax,
    total,
    is_current: overrides.is_current ?? version?.is_current ?? true,
  }
}
