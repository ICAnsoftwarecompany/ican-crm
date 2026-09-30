import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { usePortfolioMutations, usePortfolios } from '../api/portfoliosApi'
import { PortfolioDialog } from './PortfolioDialog'
import { PortfolioMembers } from './PortfolioMembers'

/** Settings section: customer portfolios (spec §12.5) and who owns each customer. */
export function PortfoliosPanel({ resource }) {
  const { t, i18n } = useTranslation()
  const portfolios = usePortfolios()
  const { remove } = usePortfolioMutations()
  const [selectedId, setSelectedId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const list = portfolios.data || []
  const selected = list.find((entry) => entry.id === selectedId) || list[0]
  const criteriaText = (criteria = {}) => [criteria.city, criteria.tier].filter(Boolean).join(' · ')

  return (
    <div className="grid gap-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h2 className="text-lg font-bold text-[var(--text)]">{t(`${resource.i18nKey}.title`)}</h2>
          <p className="text-sm text-[var(--text-muted)]">{t(`${resource.i18nKey}.description`)}</p>
        </div>
        <Button onClick={() => setEditing({})}><Plus size={16} aria-hidden="true" />{t('service.portfolios.create')}</Button>
      </header>
      <ResourceState isLoading={portfolios.isLoading} error={portfolios.error} onRetry={portfolios.refetch} empty={!list.length} emptyTitle={t('service.portfolios.empty')}>
        <ul className="grid gap-3 md:grid-cols-2" aria-label={t(`${resource.i18nKey}.title`)}>
          {list.map((portfolio) => (
            <li key={portfolio.id}>
              <div role="button" tabIndex={0} aria-pressed={selected?.id === portfolio.id} onClick={() => setSelectedId(portfolio.id)} onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && setSelectedId(portfolio.id)} className={cn('grid cursor-pointer gap-2 rounded-lg border bg-[var(--surface)] p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent', selected?.id === portfolio.id ? 'border-brand-accent' : 'border-[var(--border)] hover:bg-[var(--surface-2)]')}>
                <div className="flex items-start justify-between gap-2">
                  <span className="grid">
                    <span className="font-semibold text-[var(--text)]">{localizeLabel(portfolio.name, i18n.language, portfolio.id)}</span>
                    <span className="text-xs text-[var(--text-muted)]">{[t('service.portfolios.customersCount', { count: portfolio.members_count }), criteriaText(portfolio.criteria)].filter(Boolean).join(' · ')}</span>
                  </span>
                  <span className="flex gap-1">
                    <Button variant="ghost" size="icon" aria-label={t('service.settings.actions.edit')} onClick={(event) => { event.stopPropagation(); setEditing(portfolio) }}><Pencil size={14} aria-hidden="true" /></Button>
                    <Button variant="ghost" size="icon" aria-label={t('service.settings.actions.delete')} onClick={(event) => { event.stopPropagation(); setDeleting(portfolio) }}><Trash2 size={14} aria-hidden="true" /></Button>
                  </span>
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {(portfolio.owners || []).map((owner) => (
                    <li key={owner.id} className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-0.5 text-xs text-[var(--text)]">
                      {owner.name} · <span className="font-semibold">{owner.members_count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
        {selected && <PortfolioMembers key={selected.id} portfolio={selected} />}
      </ResourceState>
      <PortfolioDialog open={Boolean(editing)} portfolio={editing?.id ? editing : null} onClose={() => setEditing(null)} />
      <ConfirmDialog
        isOpen={Boolean(deleting)}
        type="danger"
        title={t('service.portfolios.deleteTitle')}
        message={t('service.portfolios.deleteMessage', { name: localizeLabel(deleting?.name, i18n.language, '') })}
        confirmText={t('service.settings.actions.delete')}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting.id, { onSuccess: () => { toast.success(t('service.portfolios.done.deleted')); setDeleting(null) }, onError: () => setDeleting(null) })}
      />
    </div>
  )
}
