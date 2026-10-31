import { useState } from 'react'
import { Package, Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '../../utils/dealMoney'

export function dealSummaryImages(entity) {
  const candidates = [entity?.image, ...(Array.isArray(entity?.images) ? entity.images : [])]
  return [...new Set(candidates.map((item) => typeof item === 'string' ? item : item?.url).filter((url) => typeof url === 'string' && url.trim()))]
}

function SummaryImage({ src, name }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return <a href={src} target="_blank" rel="noreferrer" className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] sm:h-28 sm:w-28">
    <img src={src} alt={name} onError={() => setFailed(true)} className="h-full w-full object-contain" />
  </a>
}

export function DealSingleProductSummary({ product, deal }) {
  const { t, i18n } = useTranslation()
  const productImages = dealSummaryImages(product)
  const dealImages = dealSummaryImages(deal).filter((src) => !productImages.includes(src))
  const service = product.kind === 'service'
  const Icon = service ? Wrench : Package
  const facts = [
    ['code', product.code],
    ['price', product.price != null ? formatMoney(product.price, i18n.language) : null],
    ['quantity', product.details?.quantity],
    ['discount', product.details?.discount != null ? formatMoney(product.details.discount, i18n.language) : null],
    ['package', product.details?.package],
    ...(!service && product.is_stock_tracked ? [['stock_quantity', product.stock_quantity]] : []),
  ].filter(([, value]) => value != null && value !== '')
  return <section aria-label={t('dealWorkspace.products.singleSummary.title')} className="grid min-w-0 gap-4 border-t border-[var(--border)] pt-4 md:grid-cols-[minmax(0,1fr)_auto]">
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]"><Icon size={15} /><span>{t(`dealWorkspace.products.singleSummary.${service ? 'service' : 'product'}`)}</span></div>
      <h2 className="break-words text-lg font-bold text-[var(--text)]">{product.name}</h2>
      {product.description && <p className="max-w-4xl whitespace-pre-wrap break-words text-sm text-[var(--text-muted)]">{product.description}</p>}
      <dl className="flex flex-wrap gap-x-6 gap-y-3 pt-1">{facts.map(([key, value]) => <div key={key} className="min-w-0 max-w-full">
        <dt className="text-xs text-[var(--text-muted)]">{t(`dealWorkspace.products.explorer.fields.${key}`, { defaultValue: t(`dealWorkspace.products.details.${key}`) })}</dt>
        <dd className="break-words text-sm font-semibold text-[var(--text)]">{String(value)}</dd>
      </div>)}</dl>
      {product.details?.notes && <p className="whitespace-pre-wrap break-words text-sm text-[var(--text-muted)]">{t('dealWorkspace.products.details.notes')}: {product.details.notes}</p>}
    </div>
    {(productImages.length > 0 || dealImages.length > 0) && <div className="flex min-w-0 flex-wrap gap-3 md:max-w-80">
      {[[productImages, product.name, 'productImages'], [dealImages, deal.name, 'dealImages']].filter(([images]) => images.length).map(([images, name, label]) => <div key={label} className="min-w-0 max-w-full space-y-1.5">
        <p className="text-xs text-[var(--text-muted)]">{t(`dealWorkspace.products.singleSummary.${label}`)}</p>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">{images.map((src) => <SummaryImage key={src} src={src} name={name} />)}</div>
      </div>)}
    </div>}
  </section>
}
