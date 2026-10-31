import { useTranslation } from 'react-i18next'
import { Hourglass, Rows3, Search, UserRoundX, X } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { DEAL_LEAD_STATUSES } from '../../constants/dealOptions'
import { dealInputClass } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'

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

/** Search, status and owner filters; the view switch lives in the workspace header. */
export function DealPipelineToolbar({ state, people, hasTeams }) {
  const { t } = useTranslation()
  const { view, status, ownerId, search, filter, lanes, setParam } = state

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
      <div className="grid w-full min-w-0 grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_11rem]">
      <div className="relative min-w-0">
        <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
        <input
          className={`${dealInputClass} ps-8`}
          value={search}
          placeholder={t('dealWorkspace.pipeline.search')}
          aria-label={t('dealWorkspace.pipeline.search')}
          onChange={(event) => setParam('q', event.target.value)}
        />
      </div>

      <select className={dealInputClass} value={status} aria-label={t('dealWorkspace.pipeline.statusFilter')} onChange={(event) => setParam('status', event.target.value)}>
        <option value="all">{t('dealWorkspace.pipeline.allStatuses')}</option>
        {DEAL_LEAD_STATUSES.map((value) => <option key={value} value={value}>{t(`dealWorkspace.options.leadStatus.${value}`)}</option>)}
      </select>
      <div className="min-w-0">
        <PersonSelect people={people} value={ownerId} onChange={(value) => setParam('owner', value)} placeholder={t('dealWorkspace.pipeline.allOwners')} />
      </div>
      </div>
      <ToggleChip active={filter === 'unassigned'} icon={UserRoundX} onClick={() => setParam('filter', filter === 'unassigned' ? '' : 'unassigned')}>{t('dealWorkspace.pipeline.unassigned')}</ToggleChip>
      <ToggleChip active={filter === 'stale'} icon={Hourglass} onClick={() => setParam('filter', filter === 'stale' ? '' : 'stale')}>{t('dealWorkspace.pipeline.stale')}</ToggleChip>
      {view === 'kanban' && hasTeams && (
        <ToggleChip active={lanes} icon={Rows3} onClick={() => setParam('lanes', lanes ? '' : 'team')}>{t('dealWorkspace.pipeline.teamLanes')}</ToggleChip>
      )}
      {(search || ownerId || filter || status !== 'open') && (
        <Button size="sm" variant="ghost" onClick={() => ['q', 'owner', 'filter', 'status'].forEach((key) => setParam(key, ''))}><X size={14} />{t('dealWorkspace.pipeline.clear')}</Button>
      )}
    </div>
  )
}
