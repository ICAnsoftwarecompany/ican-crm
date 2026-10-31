import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Package } from 'lucide-react'
import { formatMoney } from '../../utils/dealMoney'

const primaryKeys = ['code', 'kind', 'price', 'catalogPrice', 'status', 'stock_quantity', 'is_stock_tracked']
const sectionKeys = ['details', 'capability_values', 'fulfillment_config', 'data']
const hasValue = (value) => value != null && value !== '' && (typeof value !== 'object' || Object.keys(value).length > 0)

function fieldLabel(t, key) {
  return t(`dealWorkspace.products.explorer.fields.${key}`, { defaultValue: t(`dealWorkspace.products.details.${key}`, { defaultValue: key }) })
}

function Value({ value }) {
  const { t } = useTranslation()
  if (value == null || value === '') return <span>-</span>
  if (typeof value === 'boolean') return <span>{t(value ? 'dealWorkspace.products.explorer.yes' : 'dealWorkspace.products.explorer.no')}</span>
  if (typeof value === 'object') return <dl className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-x-4 gap-y-2">{Object.entries(value).map(([key, item]) => <div key={key} className="min-w-0"><dt className="text-xs text-[var(--text-muted)]">{fieldLabel(t, key)}</dt><dd className="min-w-0 break-words"><Value value={item} /></dd></div>)}</dl>
  return <span className="whitespace-pre-wrap break-words">{String(value)}</span>
}

export function DealProductFacts({ product }) {
  const { t, i18n } = useTranslation()
  const [failedImage, setFailedImage] = useState(null)
  const otherFields = Object.entries(product).filter(([key]) => ![...primaryKeys, ...sectionKeys, 'image', 'name', 'title', 'description'].includes(key))
  return <div className="min-w-0 space-y-3 text-sm text-[var(--text)]">
    <div className="flex min-w-0 items-start gap-3">
      {product.image && failedImage !== product.image
        ? <a href={product.image} target="_blank" rel="noreferrer" className="shrink-0"><img src={product.image} alt={product.name} onError={() => setFailedImage(product.image)} className="h-20 w-20 rounded-md border border-[var(--border)] object-contain sm:h-24 sm:w-24" /></a>
        : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]"><Package size={26} /></div>}
      <div className="min-w-0 flex-1">
        <h3 className="break-words text-base font-bold">{product.name}</h3>
        {product.description && <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[var(--text-muted)]">{product.description}</p>}
      </div>
    </div>
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-2">{primaryKeys.filter((key) => hasValue(product[key])).map((key) => <div key={key} className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
      <dt className="mb-1 text-[11px] text-[var(--text-muted)]">{fieldLabel(t, key)}</dt>
      <dd className="min-w-0 break-words font-semibold">{['price', 'catalogPrice'].includes(key) ? formatMoney(product[key], i18n.language) : key === 'kind' && ['product', 'service'].includes(product[key]) ? t(`dealWorkspace.products.explorer.${product[key]}`) : <Value value={product[key]} />}</dd>
    </div>)}</dl>
    {sectionKeys.filter((key) => hasValue(product[key])).map((key) => <section key={key} className="min-w-0 border-t border-[var(--border)] pt-2">
      <h4 className="mb-2 text-xs font-bold">{fieldLabel(t, key)}</h4><Value value={product[key]} />
    </section>)}
    {otherFields.length > 0 && <details className="min-w-0 border-t border-[var(--border)] pt-2">
      <summary className="cursor-pointer text-xs font-semibold text-[var(--text-muted)]">{t('dealWorkspace.products.explorer.moreDetails')}</summary>
      <dl className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-3">{otherFields.map(([key, value]) => <div key={key} className="min-w-0"><dt className="text-xs text-[var(--text-muted)]">{fieldLabel(t, key)}</dt><dd className="min-w-0"><Value value={value} /></dd></div>)}</dl>
    </details>}
  </div>
}
