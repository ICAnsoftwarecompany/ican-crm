import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import * as Tooltip from '@radix-ui/react-tooltip'
import { ArrowRight, Package, Search } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { useDealProduct, useDealProducts } from '../../hooks/useDealResources'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { dealLeadsApi } from '../../api'
import { dealKeys } from '../../constants/dealQueryKeys'
import { unwrapList } from '../../hooks/dealResponse'
import { interestedDealLeads } from '../../utils/productInterests'
import { dealLeadPath } from '../../utils/dealLeadActions'
import { formatMoney } from '../../utils/dealMoney'
import { DealProductFacts } from './DealProductFacts'
import { normalizeDealLeadList } from '../../hooks/useDealLeads'

function ProductPreview({ product, children }) {
  const { i18n } = useTranslation()
  return <Tooltip.Root><Tooltip.Trigger asChild>{children}</Tooltip.Trigger><Tooltip.Portal>
    <Tooltip.Content side="top" sideOffset={6} collisionPadding={12} className="z-[120000] max-w-xs rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] shadow-lg">
      <strong className="block break-words">{product.name}</strong>
      {product.code && <p dir="ltr">{product.code}</p>}
      {product.price != null && <p>{formatMoney(product.price, i18n.language)}</p>}
      {product.description && <p className="mt-1 line-clamp-4 whitespace-pre-wrap break-words text-xs text-[var(--text-muted)]">{product.description}</p>}
    </Tooltip.Content>
  </Tooltip.Portal></Tooltip.Root>
}

function SelectedProduct({ dealId, productId, onBack, onClose }) {
  const { t } = useTranslation()
  const { leads, leadsQuery } = useDealWorkspace()
  const client = useQueryClient()
  const query = useDealProduct(dealId, productId)
  const interests = useQuery({
    queryKey: ['deals', dealId, 'product-interests', leads.map((lead) => lead.id)],
    enabled: Boolean(query.product) && !leadsQuery.isLoading && !leadsQuery.error,
    staleTime: 60000,
    queryFn: async ({ signal }) => {
      const allLeads = new Map()
      for (let page = 1; ; page += 1) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
        const response = await dealLeadsApi.getAll(dealId, { page, per_page: 500 })
        const entries = normalizeDealLeadList(response)
        entries.forEach((lead) => allLeads.set(String(lead.id), lead))
        const pagination = response?.data?.last_page != null ? response.data : response
        if (!entries.length || (!pagination.next_page_url && (pagination.last_page == null || page >= Number(pagination.last_page)))) break
      }
      const targets = [...allLeads.values()]
      const rows = [], failed = []
      for (let offset = 0; offset < targets.length; offset += 4) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
        await Promise.all(targets.slice(offset, offset + 4).map(async (lead) => {
          try {
            const response = await client.fetchQuery({ queryKey: dealKeys.leadProducts(lead.id), queryFn: () => dealLeadsApi.getProducts(lead.id), staleTime: 60000 })
            rows.push({ id: lead.id, items: unwrapList(response, ['products', 'items']) })
          } catch { failed.push(lead.id) }
        }))
      }
      return { rows, failed, leads: targets }
    },
  })
  const customers = interestedDealLeads(interests.data?.leads || leads, productId, interests.data?.rows || [])
  return <div className="space-y-4">
    <Button size="sm" variant="ghost" onClick={onBack}><ArrowRight size={14} className="ltr:rotate-180" />{t('dealWorkspace.products.explorer.back')}</Button>
    <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch} empty={!query.product} emptyTitle={t('dealWorkspace.products.notFound')}>
      {query.product && <DealProductFacts product={query.product} />}
    </ResourceState>
    {query.product && <section className="space-y-3 border-t border-[var(--border)] pt-4">
      <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.products.explorer.interested')} ({customers.length})</h3>
      <ResourceState isLoading={leadsQuery.isLoading || interests.isLoading} error={leadsQuery.error || interests.error} onRetry={() => { leadsQuery.refetch(); interests.refetch() }}>
        {Boolean(interests.data?.failed.length) && <div role="alert" className="text-sm text-[var(--text-muted)]">{t('dealWorkspace.products.explorer.partial', { count: interests.data.failed.length })}<Button size="sm" variant="ghost" onClick={() => interests.refetch()}>{t('common.retry')}</Button></div>}
        {!customers.length && !interests.data?.failed.length && <p className="text-sm text-[var(--text-muted)]">{t('dealWorkspace.products.explorer.noInterested')}</p>}
        <ul className="divide-y divide-[var(--border)]">{customers.map((lead) => <li key={lead.id} className="py-3"><Link onClick={onClose} to={dealLeadPath(dealId, lead.id)} className="block text-sm font-semibold text-[var(--brand-accent)]">{lead.name}</Link>{lead.phone && <p dir="ltr" className="text-start text-xs text-[var(--text-muted)]">{lead.phone}</p>}</li>)}</ul>
      </ResourceState>
    </section>}
  </div>
}

export function DealProductsShortcut() {
  const { t, i18n } = useTranslation()
  const { dealId } = useDealWorkspace()
  const query = useDealProducts(dealId)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const products = useMemo(() => query.products.filter((item) => `${item.name} ${item.code || ''}`.toLowerCase().includes(search.trim().toLowerCase())), [query.products, search])
  const close = () => { setOpen(false); setSelected(null); setSearch('') }
  return <>
    <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Package size={15} />{t('dealWorkspace.products.explorer.shortcut')} {!query.isLoading && !query.error && <span>({query.products.length})</span>}</Button>
    {open && <AppDrawer open onClose={close} title={t('dealWorkspace.products.explorer.shortcut')} size="xl" drawerKey="deal-products-explorer" pushPage={false} portal>
      {selected != null ? <SelectedProduct dealId={dealId} productId={selected} onBack={() => setSelected(null)} onClose={close} /> : <div className="space-y-3">
        <label className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3"><Search size={15} className="text-[var(--text-muted)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('dealWorkspace.products.search')} aria-label={t('dealWorkspace.products.search')} className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[var(--text)] outline-none" /></label>
        <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch} empty={!products.length} emptyTitle={t('dealWorkspace.products.explorer.empty')}>
          <Tooltip.Provider delayDuration={250}><ul className="divide-y divide-[var(--border)]">{products.map((product) => <li key={product.id}>
            <ProductPreview product={product}><button type="button" onClick={() => setSelected(product.id)} className="flex w-full items-center gap-3 py-3 text-start text-[var(--text)] hover:bg-[var(--surface-2)]"><Package size={18} className="shrink-0 text-[var(--brand-accent)]" /><span className="min-w-0 flex-1 break-words text-sm font-semibold">{product.name}</span>{product.price != null && <span className="text-xs">{formatMoney(product.price, i18n.language)}</span>}</button></ProductPreview>
          </li>)}</ul></Tooltip.Provider>
        </ResourceState>
      </div>}
    </AppDrawer>}
  </>
}
