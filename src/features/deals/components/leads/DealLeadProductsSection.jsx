import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useDealLeadMutations, useDealLeadProducts } from '../../hooks/useDealLeads'
import { toItemsPayload } from '../../utils/dealMoney'
import { LineItemsEditor, toEditorLines } from '../closing/LineItemsEditor'
import { useProductOptions } from '../common/useProductOptions'

/** Products the lead is negotiating (`POST /deals/leads/products/sync`) — prefilled in the won dialog. */
export function DealLeadProductsSection({ dealId, lead }) {
  const { t } = useTranslation()
  const query = useDealLeadProducts(lead.id)
  const { options, rules } = useProductOptions(dealId)
  const { syncProducts } = useDealLeadMutations(dealId)
  const [items, setItems] = useState(() => toEditorLines([]))
  const closed = lead.status !== 'open'

  useEffect(() => {
    setItems(toEditorLines(query.items, rules))
  }, [query.items, rules])

  const save = async () => {
    try {
      await syncProducts.mutateAsync({ dealLeadId: lead.id, items: toItemsPayload(items) })
      toast.success(t('dealWorkspace.leads.products.saved'))
      query.refetch()
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.leads.products.failed')))
    }
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.leads.products.title')}</h3>
        {!closed && <Button size="sm" variant="outline" onClick={save} loading={syncProducts.isPending}>{t('dealWorkspace.leads.products.save')}</Button>}
      </div>
      {query.isLoading
        ? <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.common.loading')}</p>
        : <LineItemsEditor items={items} onChange={setItems} products={options} rules={rules} disabled={closed} />}
    </section>
  )
}
