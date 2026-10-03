import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { formatMoney, itemsTotal, lineTotal } from '../../utils/dealMoney'
import { dealInputClass } from '../common/FieldLabel'

export const EMPTY_LINE = { product_id: '', quantity: 1, unit_price: '', discount: 0 }
const OPEN_RULES = { lockedProduct: null, allowAddLines: true, fixedQuantity: null, maxQuantity: null }

/**
 * Editable product lines (product · quantity · unit price · discount · line total). `rules` come from the deal's
 * product mode (utils/dealProductMode): a locked product (one fixed line), a fixed quantity (one piece) or a
 * maximum (available units). Totals are a preview: the backend recalculates them from the saved lines.
 */
export function LineItemsEditor({ items, onChange, products = [], disabled = false, rules = OPEN_RULES }) {
  const { t, i18n } = useTranslation()
  const update = (index, patch) => onChange(items.map((item, position) => (position === index ? { ...item, ...patch } : item)))
  const pickProduct = (index, productId) => {
    const product = products.find((entry) => String(entry.id) === String(productId))
    const current = items[index]
    update(index, { product_id: productId, unit_price: current.unit_price === '' || current.unit_price === null ? (product?.price ?? '') : current.unit_price })
  }
  const setQuantity = (index, value) => {
    const max = rules.maxQuantity
    update(index, { quantity: max && Number(value) > max ? String(max) : value })
  }

  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_minmax(0,1fr)_2rem] gap-2 px-1 text-xs font-medium text-[var(--text-muted)] md:grid">
        <span>{t('dealWorkspace.closing.lines.product')}</span>
        <span>{t('dealWorkspace.closing.lines.quantity')}{rules.maxQuantity ? ` (≤ ${rules.maxQuantity})` : ''}</span>
        <span>{t('dealWorkspace.closing.lines.unitPrice')}</span>
        <span>{t('dealWorkspace.closing.lines.discount')}</span>
        <span>{t('dealWorkspace.closing.lines.total')}</span>
        <span />
      </div>
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] p-2 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_minmax(0,1fr)_2rem] md:border-0 md:p-0">
          {rules.lockedProduct ? (
            <span className="col-span-2 flex h-10 items-center truncate rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm font-semibold text-[var(--text)] md:col-span-1" aria-label={t('dealWorkspace.closing.lines.product')}>
              {rules.lockedProduct.name || `#${rules.lockedProduct.id}`}
            </span>
          ) : (
            <select className={`${dealInputClass} col-span-2 md:col-span-1`} value={item.product_id} disabled={disabled} aria-label={t('dealWorkspace.closing.lines.product')} onChange={(event) => pickProduct(index, event.target.value)}>
              <option value="">{t('dealWorkspace.common.choose')}</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name || `#${product.id}`}</option>)}
            </select>
          )}
          <input
            type="number" min="1" step="1" max={rules.maxQuantity || undefined} className={dealInputClass}
            value={rules.fixedQuantity ?? item.quantity} disabled={disabled || rules.fixedQuantity !== null}
            title={rules.fixedQuantity !== null ? t('dealWorkspace.productMode.fixedQuantityHint') : undefined}
            aria-label={t('dealWorkspace.closing.lines.quantity')} onChange={(event) => setQuantity(index, event.target.value)}
          />
          <input type="number" min="0" step="0.01" className={dealInputClass} value={item.unit_price} disabled={disabled} aria-label={t('dealWorkspace.closing.lines.unitPrice')} onChange={(event) => update(index, { unit_price: event.target.value })} />
          <input type="number" min="0" step="0.01" className={dealInputClass} value={item.discount} disabled={disabled} aria-label={t('dealWorkspace.closing.lines.discount')} onChange={(event) => update(index, { discount: event.target.value })} />
          <span className="flex h-10 items-center text-sm font-semibold text-[var(--text)]" dir="ltr">{formatMoney(lineTotal(item), i18n.language)}</span>
          <button
            type="button"
            disabled={disabled || items.length === 1 || !rules.allowAddLines}
            onClick={() => onChange(items.filter((_, position) => position !== index))}
            className="flex h-10 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-red-600 disabled:opacity-40"
            aria-label={t('dealWorkspace.closing.lines.remove')}
            title={t('dealWorkspace.closing.lines.remove')}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {rules.allowAddLines ? (
          <button type="button" disabled={disabled} onClick={() => onChange([...items, { ...EMPTY_LINE }])} className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--brand-accent)] hover:bg-[var(--brand-accent-soft)]">
            <Plus size={14} />{t('dealWorkspace.closing.lines.add')}
          </button>
        ) : <span />}
        <div className="text-sm text-[var(--text)]">
          {t('dealWorkspace.closing.lines.grandTotal')}: <strong dir="ltr">{formatMoney(itemsTotal(items), i18n.language)}</strong>
        </div>
      </div>
    </div>
  )
}

/**
 * Lead products (`GET /deals/leads/{id}/productsc`) → editor lines, shaped by the mode rules: a locked product
 * keeps one line of that product (prefilled with its price), a fixed quantity forces it.
 */
export function toEditorLines(rows = [], rules = OPEN_RULES) {
  let lines = rows.map((row) => ({
    product_id: String(row.product_id ?? row.product?.id ?? ''),
    quantity: row.quantity ?? 1,
    unit_price: row.unit_price ?? row.price ?? row.product?.price ?? '',
    discount: row.discount ?? 0,
  })).filter((line) => line.product_id)
  const locked = rules.lockedProduct
  if (locked) {
    const existing = lines.find((line) => line.product_id === String(locked.id))
    lines = [existing || { ...EMPTY_LINE, product_id: String(locked.id), unit_price: locked.price ?? '' }]
  }
  if (rules.fixedQuantity !== null && rules.fixedQuantity !== undefined) lines = lines.map((line) => ({ ...line, quantity: rules.fixedQuantity }))
  return lines.length ? lines : [{ ...EMPTY_LINE }]
}
