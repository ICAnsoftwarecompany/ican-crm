import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useCustomers } from '../../../customers'
import { useDealLeadMutations } from '../../hooks/useDealLeads'
import { getOpenStages } from '../../utils/dealStages'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'

const leadIdOf = (record) => record?.lead?.id ?? record?.lead_id ?? null

/** Search the Leads Center and add the chosen leads (`POST /deals/leads/add-existing`); duplicates are skipped by the backend. */
export function AddExistingLeadsForm({ dealId, stages, people, onDone }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Map())
  const [ownerId, setOwnerId] = useState('')
  const openStages = getOpenStages(stages)
  const [stageId, setStageId] = useState('')
  const search = useDebounce(query.trim(), 300)
  const customersQuery = useCustomers({ per_page: 20, search }, { enabled: search.length >= 2 })
  const { addExisting } = useDealLeadMutations(dealId)
  const results = useMemo(() => (customersQuery.data?.pages || []).flatMap((page) => (Array.isArray(page?.data) ? page.data : [])).filter((row) => leadIdOf(row)), [customersQuery.data])

  const toggle = (record) => setSelected((current) => {
    const next = new Map(current)
    const id = String(leadIdOf(record))
    if (next.has(id)) next.delete(id)
    else next.set(id, record.name || record.lead?.name || `#${id}`)
    return next
  })

  const submit = async () => {
    try {
      const response = await addExisting.mutateAsync({
        lead_ids: [...selected.keys()].map((id) => Number(id) || id),
        ...(ownerId ? { owner_id: Number(ownerId) || ownerId } : {}),
        ...((stageId || openStages[0]?.id) ? { stage_id: Number(stageId || openStages[0].id) || stageId } : {}),
      })
      const data = response?.data || response || {}
      toast.success(t('dealWorkspace.leads.existing.success', { added: data.added_count ?? selected.size, existing: data.existing_count ?? 0 }))
      onDone()
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.leads.existing.failed')))
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
        <input className={`${dealInputClass} ps-8`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('dealWorkspace.leads.existing.search')} aria-label={t('dealWorkspace.leads.existing.search')} />
      </div>
      <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)] p-1">
        {search.length < 2 && <p className="p-3 text-xs text-[var(--text-muted)]">{t('dealWorkspace.leads.existing.hint')}</p>}
        {customersQuery.isFetching && <p className="flex items-center gap-2 p-3 text-xs text-[var(--text-muted)]"><Loader2 size={14} className="animate-spin" />{t('dealWorkspace.common.loading')}</p>}
        {search.length >= 2 && !customersQuery.isFetching && !results.length && <p className="p-3 text-xs text-[var(--text-muted)]">{t('dealWorkspace.leads.existing.noResults')}</p>}
        {results.map((record) => {
          const id = String(leadIdOf(record))
          const checked = selected.has(id)
          return (
            <button key={id} type="button" onClick={() => toggle(record)} aria-pressed={checked} className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-start text-sm ${checked ? 'bg-[var(--brand-accent-soft)]' : 'hover:bg-[var(--surface-2)]'}`}>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[var(--text)]">{record.name || record.lead?.name || `#${id}`}</span>
                <span className="block text-xs text-[var(--text-muted)]" dir="ltr">{record.phone || record.lead?.phone || ''}</span>
              </span>
              {checked && <Check size={16} className="shrink-0 text-[var(--brand-accent)]" />}
            </button>
          )
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldLabel label={t('dealWorkspace.fields.owner')}><PersonSelect people={people} value={ownerId} onChange={setOwnerId} placeholder={t('dealWorkspace.leads.keepOwner')} /></FieldLabel>
        <FieldLabel label={t('dealWorkspace.fields.stage')}>
          <select className={dealInputClass} value={stageId} onChange={(event) => setStageId(event.target.value)}>
            {openStages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
          </select>
        </FieldLabel>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.leads.existing.selected', { count: selected.size })}</span>
        <Button onClick={submit} disabled={!selected.size || addExisting.isPending} loading={addExisting.isPending}>{t('dealWorkspace.leads.existing.submit')}</Button>
      </div>
    </div>
  )
}
