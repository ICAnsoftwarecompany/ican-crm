import { useTranslation } from 'react-i18next'
import { ExternalLink, FileText, Mail, Phone, UserRound } from 'lucide-react'

import { cn } from '../../../../../../shared/utils/cn'
import { formatMoney } from '../../utils/proposalPayloads'

function BlockShell({ children, editable, selected, onClick, className }) {
  return (
    <div
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (editable && (event.key === 'Enter' || event.key === ' ')) onClick?.(event)
      }}
      className={cn(
        'relative rounded-lg transition',
        editable && 'cursor-pointer outline outline-1 outline-transparent hover:outline-[#00C2CB]/45',
        selected && 'outline outline-2 outline-[#00C2CB] ring-4 ring-[#00C2CB]/10',
        className
      )}
    >
      {children}
    </div>
  )
}

function CustomerInfo({ customer, data }) {
  const { t } = useTranslation()
  const rows = [
    { show: true, icon: UserRound, label: t('proposals.wizard.steps.customer'), value: customer?.name },
    { show: data?.show_email !== false, icon: Mail, label: t('proposals.builder.fields.email'), value: customer?.email },
    { show: data?.show_phone !== false, icon: Phone, label: t('customers.phone'), value: customer?.phone },
    { show: data?.show_company !== false, icon: FileText, label: t('proposals.renderer.companyLabel'), value: customer?.company },
  ].filter((item) => item.show && item.value)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="flex items-center gap-3 rounded-lg border border-[#DCE8F3] bg-white px-3 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
              <Icon size={17} />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-500">{item.label}</div>
              <div className="truncate text-sm font-black text-slate-900">{item.value}</div>
            </div>
          </div>
        )
      })}
      {!rows.length ? <div className="text-sm font-semibold text-slate-500">{t('proposals.renderer.noCustomerInfoYet')}</div> : null}
    </div>
  )
}

function PricingBlock({ options = [], currency }) {
  const { t } = useTranslation()

  if (!options.length) {
    return (
      <div className="rounded-lg border border-dashed border-[#C9D8E8] bg-[#F8FAFC] px-4 py-5 text-sm font-bold text-slate-500">
        {t('proposals.pricing.noPricingOptionsYet')}
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {options.map((option) => (
        <div key={option.id || option.name} className="rounded-lg border border-[#DCE8F3] bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-black text-slate-950">{option.name || t('proposals.renderer.optionFallback')}</div>
              <p className="mt-1 text-xs font-semibold text-slate-500">{option.description || t('proposals.renderer.noDescription')}</p>
            </div>
            {option.is_recommended ? (
              <span className="rounded-full bg-[#E8F9FA] px-2 py-1 text-[11px] font-black text-[#007A80]">{t('proposals.renderer.recommendedBadge')}</span>
            ) : null}
          </div>
          <div className="mt-4 rounded-lg bg-[#F6F9FC] px-3 py-2 text-lg font-black text-[#162847]" dir="ltr">
            {formatMoney(option.total ?? option.subtotal, currency)}
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductsBlock({ products = [], title }) {
  const { t } = useTranslation()

  if (!products.length) {
    return (
      <div className="rounded-lg border border-dashed border-[#C9D8E8] bg-[#F8FAFC] px-4 py-5 text-sm font-bold text-slate-500">
        {t('proposals.renderer.chooseProductsHint')}
      </div>
    )
  }

  return (
    <div>
      {title ? <h3 className="mb-3 text-lg font-black text-slate-950">{title}</h3> : null}
      <div className="flex flex-wrap gap-2">
        {products.slice(0, 8).map((product) => (
          <span key={product.id || product.name} className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-black text-[#1D4ED8]">
            {product.name || product.product?.name || t('proposals.pricing.productFallback', { id: product.id })}
          </span>
        ))}
      </div>
    </div>
  )
}

function renderBlock(block, context) {
  const data = block.data || {}
  const styles = block.styles || {}
  const align = styles.align || 'start'
  const { t } = context

  if (block.type === 'cover') {
    return (
      <div className="overflow-hidden rounded-xl border border-[#D7E5F2] bg-[#F0FDFF]">
        {data.image_url ? (
          <img src={data.image_url} alt="" className="h-56 w-full object-cover" />
        ) : null}
        <div className={cn('px-8 py-10', align === 'center' && 'text-center', align === 'end' && 'text-end')}>
          <div className="text-xs font-black uppercase tracking-wide text-[#007A80]">{data.eyebrow || t('proposals.builder.defaults.coverEyebrow')}</div>
          <h1 className="mt-3 text-4xl font-black leading-tight text-[#162847]">{data.title || context.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600">{data.subtitle}</p>
        </div>
      </div>
    )
  }

  if (block.type === 'heading') {
    const Tag = data.level === 'h1' ? 'h1' : data.level === 'h3' ? 'h3' : 'h2'
    return <Tag className={cn('font-black text-[#162847]', Tag === 'h1' && 'text-4xl', Tag === 'h2' && 'text-2xl', Tag === 'h3' && 'text-xl')} style={{ textAlign: align, color: styles.color }}>{data.text}</Tag>
  }

  if (block.type === 'text') {
    return <p className="whitespace-pre-wrap text-sm font-semibold leading-8 text-slate-700" style={{ textAlign: align }}>{data.content}</p>
  }

  if (block.type === 'image') {
    return data.url ? (
      <figure>
        <img src={data.url} alt={data.caption || ''} className="max-h-[420px] w-full rounded-lg object-cover" />
        {data.caption ? <figcaption className="mt-2 text-center text-xs font-semibold text-slate-500">{data.caption}</figcaption> : null}
      </figure>
    ) : (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[#C9D8E8] bg-[#F8FAFC] text-sm font-bold text-slate-500">
        {t('proposals.renderer.addImageUrlHint')}
      </div>
    )
  }

  if (block.type === 'button') {
    return (
      <a href={data.url || '#'} className="inline-flex items-center gap-2 rounded-lg bg-[#162847] px-5 py-3 text-sm font-black text-white">
        {data.label || t('proposals.builder.defaults.linkLabel')} <ExternalLink size={15} />
      </a>
    )
  }

  if (block.type === 'divider') return <hr className="border-[#DCE8F3]" />
  if (block.type === 'spacer') return <div style={{ height: Number(data.height) || 24 }} />
  if (block.type === 'customer_info') return <CustomerInfo customer={context.customer} data={data} />

  if (block.type === 'company_info') {
    return (
      <div className="rounded-lg border border-[#DCE8F3] bg-white p-4">
        <div className="text-lg font-black text-[#162847]">{data.name || t('proposals.renderer.companyLabel')}</div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
          {[data.email, data.phone, data.address].filter(Boolean).map((value) => <span key={value}>{value}</span>)}
        </div>
      </div>
    )
  }

  if (block.type === 'products') return <ProductsBlock products={context.products} title={data.title} />
  if (block.type === 'pricing') return <PricingBlock options={context.options} currency={context.currency} />
  if (block.type === 'terms') return <p className="rounded-lg bg-[#FFFBEB] p-4 text-sm font-semibold leading-8 text-[#92400E]">{data.content}</p>

  if (block.type === 'signature') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-dashed border-[#94A3B8] p-6">
          <div className="h-10 border-b border-[#94A3B8]" />
          <div className="mt-2 text-xs font-black text-slate-600">{data.line_label || t('proposals.builder.defaults.signatureLineLabel')}</div>
        </div>
        <div className="rounded-lg bg-[#F8FAFC] p-4 text-sm font-bold text-slate-600">
          <div>{data.signer_name || t('proposals.renderer.signerNameFallback')}</div>
          <div className="mt-1 text-xs text-slate-500">{data.signer_title || t('proposals.renderer.jobTitleFallback')}</div>
        </div>
      </div>
    )
  }

  if (block.type === 'page_break') return <div className="my-3 border-t border-dashed border-[#94A3B8] pt-2 text-center text-xs font-black text-slate-400">{data.label || t('proposals.builder.defaults.pageBreakLabel')}</div>
  if (block.type === 'video') return <div className="rounded-lg border border-[#DCE8F3] bg-[#F8FAFC] p-4 text-sm font-bold text-slate-600">{data.title || t('proposals.builder.blockTypes.video')}: {data.url || t('proposals.renderer.noLinkAdded')}</div>
  if (block.type === 'link') return <a href={data.url || '#'} className="inline-flex items-center gap-2 text-sm font-black text-[#007A80] underline">{data.label || data.url || t('proposals.builder.blockTypes.link')} <ExternalLink size={14} /></a>

  return (
    <div className="rounded-lg border border-[#DCE8F3] bg-[#F8FAFC] p-4">
      <div className="text-xs font-black text-slate-500">{data.label || block.name || t('proposals.builder.defaults.customLabel')}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm font-semibold text-slate-700">{data.value || data.content || ''}</div>
    </div>
  )
}

export function ProposalRenderer({
  content,
  proposal,
  options = [],
  products = [],
  editable = false,
  selected,
  onSelect,
  className,
}) {
  const { t } = useTranslation()
  const design = content?.design || {}
  const visibleSections = (content?.sections || []).filter((section) => section.is_visible !== false)
  const customer = content?.customer || proposal?.metadata?.customer || proposal?.customer || {}

  return (
    <article
      dir="rtl"
      className={cn('mx-auto min-h-[920px] w-full max-w-[900px] bg-white p-8 text-slate-950 shadow-sm', className)}
      style={{ fontFamily: design.font_family || 'Arial', fontSize: `${design.font_size || 14}px` }}
    >
      {visibleSections.map((section) => (
        <section key={section.id} className="mb-8 rounded-xl border border-[#E2E8F0] bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#EDF2F7] pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">{section.title}</h2>
              {section.description ? <p className="mt-1 text-xs font-semibold text-slate-500">{section.description}</p> : null}
            </div>
          </div>
          <div className="space-y-4">
            {(section.blocks || []).filter((block) => block.is_visible !== false).map((block) => (
              <BlockShell
                key={block.id}
                editable={editable}
                selected={selected?.type === 'block' && selected?.id === block.id}
                onClick={(event) => {
                  event.stopPropagation()
                  onSelect?.({ type: 'block', id: block.id, sectionId: section.id })
                }}
              >
                {renderBlock(block, {
                  title: content?.title || proposal?.title,
                  customer,
                  options,
                  products,
                  currency: proposal?.currency,
                  t,
                })}
              </BlockShell>
            ))}
          </div>
        </section>
      ))}
    </article>
  )
}
