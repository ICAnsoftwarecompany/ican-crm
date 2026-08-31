import { DEFAULT_COMPANY_INFO, DEFAULT_PROPOSAL_DESIGN, DEFAULT_PROPOSAL_SETTINGS } from '../constants/proposalBuilderDefaults'

export function createUid(prefix = 'item') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function createDefaultBlock(type, seed = {}) {
  const id = seed.id || createUid(type)

  const defaults = {
    cover: {
      name: 'غلاف العرض',
      data: { eyebrow: 'عرض سعر', title: 'عرض مخصص للعميل', subtitle: 'حلول عملية بتفاصيل واضحة', image_url: '' },
      styles: { align: 'center', background: '#F0FDFF' },
    },
    heading: {
      name: 'عنوان',
      data: { text: 'عنوان جديد', level: 'h2' },
      styles: { align: 'start', color: DEFAULT_PROPOSAL_DESIGN.primary_color },
    },
    text: {
      name: 'نص',
      data: { content: 'اكتب محتوى هذا الجزء هنا.' },
      styles: { align: 'start' },
    },
    image: {
      name: 'صورة',
      data: { url: '', caption: '' },
      styles: { fit: 'cover' },
    },
    button: {
      name: 'زر',
      data: { label: 'قبول العرض', url: '' },
      styles: { variant: 'primary' },
    },
    divider: { name: 'فاصل', data: {}, styles: {} },
    spacer: { name: 'مسافة', data: { height: 24 }, styles: {} },
    customer_info: {
      name: 'بيانات العميل',
      data: { show_email: true, show_phone: true, show_company: true },
      styles: {},
    },
    company_info: {
      name: 'بيانات الشركة',
      data: DEFAULT_COMPANY_INFO,
      styles: {},
    },
    products: { name: 'المنتجات', data: { title: 'المنتجات المقترحة' }, styles: {} },
    pricing: { name: 'الأسعار', data: { title: 'خيارات الأسعار' }, styles: {} },
    terms: {
      name: 'الشروط',
      data: { content: 'هذا العرض صالح حتى تاريخ الانتهاء الموضح، ويتم الاتفاق على تفاصيل التنفيذ قبل البدء.' },
      styles: {},
    },
    signature: {
      name: 'التوقيع',
      data: { signer_name: '', signer_title: '', line_label: 'توقيع العميل' },
      styles: {},
    },
    page_break: { name: 'فاصل صفحة', data: { label: 'صفحة جديدة' }, styles: {} },
    video: { name: 'فيديو', data: { url: '', title: 'فيديو توضيحي' }, styles: {} },
    custom: { name: 'ملاحظة مخصصة', data: { label: 'ملاحظة', value: '' }, styles: {} },
    link: { name: 'رابط', data: { label: 'فتح الرابط', url: '' }, styles: {} },
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

export function createDefaultSection(seed = {}) {
  return {
    id: seed.id || createUid('section'),
    title: seed.title || 'قسم جديد',
    description: seed.description || '',
    is_visible: seed.is_visible ?? true,
    blocks: seed.blocks || [createDefaultBlock('heading'), createDefaultBlock('text')],
  }
}

export function createDefaultBuilderContent(proposal = {}, customer = null) {
  const customerName = customer?.name || proposal?.metadata?.customer_name || proposal?.metadata?.client_name || 'العميل'
  return {
    schema_version: 1,
    title: proposal?.title || 'عرض سعر جديد',
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
        title: 'الغلاف',
        blocks: [
          createDefaultBlock('cover', {
            data: {
              eyebrow: 'عرض سعر',
              title: proposal?.title || `عرض مخصص إلى ${customerName}`,
              subtitle: proposal?.description || 'تفاصيل العرض، المنتجات، الأسعار وخطوات التنفيذ.',
              image_url: '',
            },
          }),
          createDefaultBlock('customer_info'),
        ],
      }),
      createDefaultSection({
        title: 'نطاق العمل',
        blocks: [
          createDefaultBlock('heading', { data: { text: 'نطاق العمل', level: 'h2' } }),
          createDefaultBlock('text', { data: { content: 'نوضح هنا ما سيتم تنفيذه للعميل والنتائج المتوقعة من العرض.' } }),
          createDefaultBlock('products'),
        ],
      }),
      createDefaultSection({
        title: 'الأسعار والشروط',
        blocks: [
          createDefaultBlock('pricing'),
          createDefaultBlock('terms'),
          createDefaultBlock('signature'),
        ],
      }),
    ],
  }
}

function normalizeOldSection(section, index) {
  if (section?.blocks?.length) {
    return {
      id: String(section.id || createUid(`section_${index}`)),
      title: section.title || section.name || `قسم ${index + 1}`,
      description: section.description || '',
      is_visible: section.is_visible ?? true,
      blocks: section.blocks.map((block, blockIndex) => createDefaultBlock(block.type || 'text', {
        ...block,
        id: String(block.id || createUid(`block_${index}_${blockIndex}`)),
      })),
    }
  }

  return createDefaultSection({
    id: String(section?.id || createUid(`section_${index}`)),
    title: section?.title || section?.name || `قسم ${index + 1}`,
    blocks: [
      createDefaultBlock('heading', { data: { text: section?.title || section?.name || `قسم ${index + 1}` } }),
      createDefaultBlock('text', { data: { content: section?.content || section?.description || '' } }),
    ],
  })
}

export function normalizeBuilderContent(rawContent, proposal = {}) {
  if (!rawContent) return createDefaultBuilderContent(proposal)

  let content = rawContent
  if (typeof rawContent === 'string') {
    try {
      content = JSON.parse(rawContent)
    } catch (_error) {
      return createDefaultBuilderContent(proposal)
    }
  }

  const sections = Array.isArray(content?.sections) && content.sections.length
    ? content.sections.map(normalizeOldSection)
    : createDefaultBuilderContent(proposal).sections

  return {
    schema_version: content?.schema_version || 1,
    title: content?.title || proposal?.title || 'عرض سعر',
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
