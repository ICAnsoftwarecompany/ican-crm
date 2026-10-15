import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Search } from 'lucide-react'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { cn } from '../../../../../shared/utils/cn'
import { useCampaignLists } from '../../../../campaigns'
import { dealInputClass } from '../../common/FieldLabel'

const nameOf = (row) => row?.name || row?.campaign_name || row?.title || `#${row?.id}`

/**
 * CRM campaigns (active first, then inactive) to link to the deal: `POST /deals/{id}/campaigns { campaign_ids, is_active }`.
 * `value`: the source state (`campaignIds`, `campaignsActive`).
 */
export function CampaignPicker({ value, onChange, error }) {
  const { t } = useTranslation()
  const lists = useCampaignLists()
  const [query, setQuery] = useState('')
  const campaigns = useMemo(() => {
    const seen = new Set()
    return [...(lists.active.data || []).map((row) => ({ row, active: true })), ...(lists.inactive.data || []).map((row) => ({ row, active: false }))]
      .filter(({ row }) => row?.id !== undefined && !seen.has(String(row.id)) && seen.add(String(row.id)))
      .map(({ row, active }) => ({ id: String(row.id), name: nameOf(row), active, meta: [row.platform, row.objective, row.page_name].filter(Boolean).join(' · ') }))
  }, [lists.active.data, lists.inactive.data])
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()
    return text ? campaigns.filter((item) => `${item.name} ${item.meta}`.toLowerCase().includes(text)) : campaigns
  }, [campaigns, query])
  const selected = value.campaignIds.map(String)
  const toggle = (id) => onChange({ campaignIds: selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id] })
  const names = campaigns.filter((item) => selected.includes(item.id)).map((item) => item.name)

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <section className="flex min-w-0 flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <header>
          <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.wizard.source.campaigns.title')}</h3>
          <p className="text-xs leading-5 text-[var(--text-muted)]">{t('dealWorkspace.wizard.source.campaigns.description')}</p>
        </header>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
          <input className={`${dealInputClass} ps-8`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('dealWorkspace.wizard.team.search')} aria-label={t('dealWorkspace.wizard.source.campaigns.search')} />
        </div>
        <ResourceState
          isLoading={lists.isLoading}
          error={lists.active.error && lists.inactive.error ? lists.error : null}
          onRetry={() => { lists.active.refetch(); lists.inactive.refetch() }}
          empty={!campaigns.length}
          emptyTitle={t('dealWorkspace.wizard.source.campaigns.emptyTitle')}
          emptyDescription={t('dealWorkspace.wizard.source.campaigns.emptyDescription')}
        >
          <ul className="max-h-80 space-y-1 overflow-y-auto pe-1">
            {visible.map((item) => {
              const checked = selected.includes(item.id)
              return (
                <li key={item.id}>
                  <label className={cn('flex cursor-pointer items-center gap-2 rounded-md px-2 py-2', checked ? 'bg-[var(--brand-accent-soft)]' : 'hover:bg-[var(--surface-2)]')}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(item.id)} aria-label={item.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-[var(--text)]">{item.name}</span>
                      {item.meta && <span className="block truncate text-xs text-[var(--text-muted)]">{item.meta}</span>}
                    </span>
                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', item.active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-[var(--surface-2)] text-[var(--text-muted)]')}>
                      {t(`dealWorkspace.wizard.source.campaigns.${item.active ? 'active' : 'inactive'}`)}
                    </span>
                  </label>
                </li>
              )
            })}
            {!visible.length && <li className="p-3 text-center text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.noMatch')}</li>}
          </ul>
        </ResourceState>
      </section>

      <aside className="space-y-3">
        <section className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.wizard.source.campaigns.selected', { count: selected.length })}</h3>
          {names.length ? (
            <ul className="space-y-1">{names.map((name) => <li key={name} className="flex items-center gap-1.5 text-sm text-[var(--text)]"><Check size={14} className="shrink-0 text-[var(--brand-accent)]" />{name}</li>)}</ul>
          ) : <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.source.campaigns.none')}</p>}
        </section>
        <label className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)]">
          <input type="checkbox" className="mt-1" checked={value.campaignsActive !== false} onChange={(event) => onChange({ campaignsActive: event.target.checked })} />
          <span>
            {t('dealWorkspace.wizard.source.campaigns.activeLabel')}
            <span className="block text-xs leading-5 text-[var(--text-muted)]">{t('dealWorkspace.wizard.source.campaigns.activeHint')}</span>
          </span>
        </label>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </aside>
    </div>
  )
}
