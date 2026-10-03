import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Search } from 'lucide-react'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { flattenCatalog, useProducts } from '../../../products'
import { useDealResourceMutations } from '../../hooks/useDealResources'
import { dealInputClass } from '../common/FieldLabel'

/** Pick catalog products for the deal (`POST /deals/products`, product_ids[]). Products already on the deal are hidden. */
export function AttachProductsDialog({ dealId, existingIds = [], open, onClose }) {
  const { t } = useTranslation()
  const catalog = useProducts()
  const { addProducts } = useDealResourceMutations(dealId)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set())

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(new Set())
    }
  }, [open])

  const rows = useMemo(() => {
    const existing = new Set(existingIds.map(String))
    const needle = query.trim().toLowerCase()
    return flattenCatalog(Array.isArray(catalog.data) ? catalog.data : [])
      .filter((row) => row.active && !existing.has(String(row.id)))
      .filter((row) => !needle || `${row.name} ${row.category}`.toLowerCase().includes(needle))
  }, [catalog.data, existingIds, query])

  const toggle = (id) => setSelected((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const submit = async () => {
    try {
      await addProducts.mutateAsync([...selected].map((id) => Number(id) || id))
      toast.success(t('dealWorkspace.products.attached', { count: selected.size }))
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.products.attachFailed')))
    }
  }

  return (
    <FormDialog open={open} onClose={onClose} onSubmit={submit} loading={addProducts.isPending} submitDisabled={!selected.size} title={t('dealWorkspace.products.attachTitle')} submitText={t('dealWorkspace.products.attachSubmit', { count: selected.size })}>
      <div className="space-y-2">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
          <input className={`${dealInputClass} ps-8`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('dealWorkspace.products.search')} aria-label={t('dealWorkspace.products.search')} />
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)] p-1">
          {catalog.isLoading && <p className="p-3 text-xs text-[var(--text-muted)]">{t('dealWorkspace.common.loading')}</p>}
          {!catalog.isLoading && !rows.length && <p className="p-3 text-xs text-[var(--text-muted)]">{t('dealWorkspace.products.noCatalog')}</p>}
          {rows.map((row) => {
            const id = String(row.id)
            const checked = selected.has(id)
            return (
              <button key={id} type="button" onClick={() => toggle(id)} aria-pressed={checked} className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-start text-sm ${checked ? 'bg-[var(--brand-accent-soft)]' : 'hover:bg-[var(--surface-2)]'}`}>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-[var(--text)]">{row.name || `#${id}`}</span>
                  {row.category && <span className="block text-xs text-[var(--text-muted)]">{row.category}</span>}
                </span>
                {checked && <Check size={16} className="shrink-0 text-[var(--brand-accent)]" />}
              </button>
            )
          })}
        </div>
      </div>
    </FormDialog>
  )
}
