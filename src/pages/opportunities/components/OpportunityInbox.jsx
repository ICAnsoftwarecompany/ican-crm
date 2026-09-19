import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Flame, Eye as EyeIcon, Clock, Sparkles, Cog, Megaphone, Inbox } from 'lucide-react'
import { ResourceState } from '../../../shared/components/data/ResourceState'
import { Avatar } from '../../../shared/components/ui/Avatar'
import { useOpportunities } from '../../../features/opportunities/hooks/useOpportunities'
import { useOpportunityDrawerStore } from '../../../features/opportunities/store/opportunityDrawerStore'
import { isHighPotentialOpportunity, isOpportunityOverdue } from '../../../features/opportunities/utils/opportunityFormatters'

const GROUP_DEFINITIONS = [
  { id: 'high_potential', icon: Flame, color: '#EF4444', match: (row) => isHighPotentialOpportunity(row) },
  { id: 'needs_review', icon: EyeIcon, color: '#F59E0B', match: (row) => row.status === 'reviewing' },
  { id: 'needs_attention', icon: Clock, color: '#DC2626', match: (row, now) => isOpportunityOverdue(row, now) },
  { id: 'ai_suggested', icon: Sparkles, color: '#00C2CB', match: (row) => row.source?.type === 'ai' },
  { id: 'system_detected', icon: Cog, color: '#8B5CF6', match: (row) => row.source?.type === 'system_rule' },
  { id: 'campaign_generated', icon: Megaphone, color: '#3B82F6', match: (row) => row.source?.type === 'campaign' },
  { id: 'watching', icon: EyeIcon, color: '#6366F1', match: (row) => row.status === 'watching' },
]

function InboxRow({ opportunity, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(opportunity.id)}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-start transition-colors hover:bg-[var(--surface-2)]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[var(--text)]">{opportunity.customer?.name}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">{opportunity.title}</p>
      </div>
      <span className="shrink-0 inline-flex items-center justify-center h-7 min-w-7 px-1.5 rounded-full bg-[#00C2CB] text-white text-xs font-black font-latin">
        {opportunity.score?.total ?? '-'}
      </span>
      <div className="shrink-0 flex items-center gap-1.5">
        <Avatar name={opportunity.assigned_user?.name || '?'} size="sm" />
      </div>
    </button>
  )
}

function InboxGroup({ group, rows, expanded, onToggle, onOpen, t }) {
  const Icon = group.icon

  return (
    <section className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(group.id)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${group.color}18` }}>
            <Icon size={16} style={{ color: group.color }} />
          </div>
          <span className="font-bold text-sm text-[var(--text)]">{t(`opportunities.groups.${group.id}`)}</span>
          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs font-bold text-[var(--text-muted)]">
            {rows.length}
          </span>
        </div>
        <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)] px-1.5 py-1.5">
          {rows.length === 0 ? (
            <p className="px-3 py-3 text-xs text-[var(--text-muted)]">{t('opportunities.inbox.emptyGroup')}</p>
          ) : (
            rows.map((opportunity) => (
              <InboxRow key={opportunity.id} opportunity={opportunity} onOpen={onOpen} />
            ))
          )}
        </div>
      )}
    </section>
  )
}

export function OpportunityInbox() {
  const { t } = useTranslation()
  const opportunitiesQuery = useOpportunities()
  const openDrawer = useOpportunityDrawerStore((state) => state.open)
  const rows = opportunitiesQuery.data || []
  const [expandedGroups, setExpandedGroups] = useState({
    high_potential: true,
    needs_review: true,
    needs_attention: true,
  })

  const toggleGroup = (groupId) => {
    setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }))
  }

  const groups = useMemo(() => {
    const now = Date.now()
    const activeRows = rows.filter((row) => !['dismissed', 'expired'].includes(row.status))

    return GROUP_DEFINITIONS.map((group) => ({
      ...group,
      rows: activeRows
        .filter((row) => group.match(row, now))
        .sort((a, b) => (Number(b.score?.total) || 0) - (Number(a.score?.total) || 0)),
    }))
  }, [rows])

  return (
    <ResourceState
      isLoading={opportunitiesQuery.isLoading}
      error={opportunitiesQuery.error}
      empty={rows.length === 0}
      emptyIcon={<Inbox size={24} />}
      emptyTitle={t('opportunities.inbox.empty')}
      onRetry={opportunitiesQuery.refetch}
    >
      <div className="grid gap-3">
        {groups.map((group) => (
          <InboxGroup
            key={group.id}
            group={group}
            rows={group.rows}
            expanded={Boolean(expandedGroups[group.id])}
            onToggle={toggleGroup}
            onOpen={openDrawer}
            t={t}
          />
        ))}
      </div>
    </ResourceState>
  )
}
