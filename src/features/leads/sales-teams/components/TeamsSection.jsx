import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, UsersRound } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { TEAM_TYPES, filterTeamRows } from '../utils/teamModel'
import { TeamCard } from './TeamCard'

/** Teams tab: search / type / status filters and a grid of team cards. */
export function TeamsSection({ data, onCreate, onEdit, onAddRule, onShowRules }) {
  const { t } = useTranslation()
  const [filters, setFilters] = useState({ search: '', type: '', status: '' })
  const setFilter = (key) => (value) => setFilters((current) => ({ ...current, [key]: value }))
  const rows = filterTeamRows(data.teams, { search: filters.search, type: filters.type || 'all', status: filters.status || 'all' })

  return (
    <section className="space-y-3">
      <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-[minmax(0,1fr)_180px_160px]">
        <Input
          value={filters.search}
          onChange={(event) => setFilter('search')(event.target.value)}
          placeholder={t('salesTeams.teams.searchPlaceholder')}
          aria-label={t('salesTeams.teams.searchPlaceholder')}
          startIcon={<Search size={15} />}
        />
        <Select
          value={filters.type}
          onChange={setFilter('type')}
          placeholder={t('salesTeams.filters.allTypes')}
          aria-label={t('salesTeams.teams.type')}
          options={TEAM_TYPES.map((type) => ({ value: type, label: t(`salesTeams.teamTypes.${type}.label`) }))}
        />
        <Select
          value={filters.status}
          onChange={setFilter('status')}
          placeholder={t('salesTeams.filters.allStatuses')}
          aria-label={t('salesTeams.filters.status')}
          options={[{ value: 'active', label: t('salesTeams.common.active') }, { value: 'inactive', label: t('salesTeams.common.inactive') }]}
        />
      </div>

      <ResourceState
        isLoading={data.teamsQuery.isLoading}
        error={data.teamsQuery.error}
        empty={data.teams.length === 0}
        emptyIcon={<UsersRound size={24} />}
        emptyTitle={t('salesTeams.teams.emptyTitle')}
        emptyDescription={t('salesTeams.teams.emptyDescription')}
        onRetry={data.teamsQuery.refetch}
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={<Search size={22} />}
            title={t('salesTeams.common.noResults')}
            action={<Button variant="outline" onClick={() => setFilters({ search: '', type: '', status: '' })}>{t('salesTeams.filters.clear')}</Button>}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {rows.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                ruleCount={data.rulesByTeam.get(team.id)}
                onEdit={() => onEdit(team)}
                onAddRule={() => onAddRule(team)}
                onShowRules={onShowRules}
              />
            ))}
          </div>
        )}
      </ResourceState>
      {data.teams.length === 0 && !data.teamsQuery.isLoading && !data.teamsQuery.error && (
        <div className="flex justify-center">
          <Button variant="accent" onClick={onCreate}>{t('salesTeams.teams.new')}</Button>
        </div>
      )}
    </section>
  )
}
