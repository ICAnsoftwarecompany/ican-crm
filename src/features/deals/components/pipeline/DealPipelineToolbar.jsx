import { useTranslation } from 'react-i18next'
import { Hourglass, Plus, Rows3, Search, UserRoundX, X } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { DEAL_LEAD_STATUSES } from '../../constants/dealOptions'
import { dealInputClass } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'
import { ViewToggle } from '../common/ViewToggle'

function ToggleChip({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors',
        active ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--text)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
      )}
    >
      <Icon size={14} />{children}
    </button>
  )
}

/** View switch (board / table), filters and "add leads" for the pipeline page. */
export function DealPipelineToolbar({ state, people, hasTeams, onAdd }) {
  const { t } = useTranslation()
  const { view, status, ownerId, search, filter, lanes, setParam, setView } = state

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
      <ViewToggle value={view} onChange={setView} label={t('dealWorkspace.pipeline.viewLabel')} />

      <div className="relative min-w-[180px] flex-1">
        <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
        <input
          className={`${dealInputClass} ps-8`}
          value={search}
          placeholder={t('dealWorkspace.pipeline.search')}
          aria-label={t('dealWorkspace.pipeline.search')}
          onChange={(event) => setParam('q', event.target.value)}
        />
      </div>

      <select className={`${dealInputClass} w-auto`} value={status} aria-label={t('dealWorkspace.pipeline.statusFilter')} onChange={(event) => setParam('status', event.target.value)}>
        <option value="all">{t('dealWorkspace.pipeline.allStatuses')}</option>
        {DEAL_LEAD_STATUSES.map((value) => <option key={value} value={value}>{t(`dealWorkspace.options.leadStatus.${value}`)}</option>)}
      </select>
      <div className="w-44">
        <PersonSelect people={people} value={ownerId} onChange={(value) => setParam('owner', value)} placeholder={t('dealWorkspace.pipeline.allOwners')} />
      </div>
      <ToggleChip active={filter === 'unassigned'} icon={UserRoundX} onClick={() => setParam('filter', filter === 'unassigned' ? '' : 'unassigned')}>{t('dealWorkspace.pipeline.unassigned')}</ToggleChip>
      <ToggleChip active={filter === 'stale'} icon={Hourglass} onClick={() => setParam('filter', filter === 'stale' ? '' : 'stale')}>{t('dealWorkspace.pipeline.stale')}</ToggleChip>
      {view === 'kanban' && hasTeams && (
        <ToggleChip active={lanes} icon={Rows3} onClick={() => setParam('lanes', lanes ? '' : 'team')}>{t('dealWorkspace.pipeline.teamLanes')}</ToggleChip>
      )}
      {(search || ownerId || filter || status !== 'open') && (
        <Button size="sm" variant="ghost" onClick={() => ['q', 'owner', 'filter', 'status'].forEach((key) => setParam(key, ''))}><X size={14} />{t('dealWorkspace.pipeline.clear')}</Button>
      )}
      <Button size="sm" className="ms-auto" onClick={onAdd}><Plus size={15} />{t('dealWorkspace.leads.add')}</Button>
    </div>
  )
}
