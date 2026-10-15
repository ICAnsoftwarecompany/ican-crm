import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GitBranch, Search } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { ASSIGN_TYPES, filterRules } from '../utils/ruleModel'
import { RulesGuide } from './RulesGuide'
import { RuleCard } from './RuleCard'
import { useConditionLabels } from '../hooks/useRuleConditionOptions'

const EMPTY_FILTERS = { search: '', status: '', assignType: '' }

/** Rules tab: how distribution works, filters and the rules in priority order. `editor` = useRuleEditor(). */
export function RulesSection({ data, editor }) {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const conditionLabels = useConditionLabels()
  const setFilter = (key) => (value) => setFilters((current) => ({ ...current, [key]: value }))
  const rows = filterRules(data.rules, { search: filters.search, status: filters.status || 'all', assignType: filters.assignType || 'all' })

  return (
    <section className="space-y-3">
      <RulesGuide />

      <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-[minmax(0,1fr)_200px_160px]">
        <Input
          value={filters.search}
          onChange={(event) => setFilter('search')(event.target.value)}
          placeholder={t('salesTeams.rules.searchPlaceholder')}
          aria-label={t('salesTeams.rules.searchPlaceholder')}
          startIcon={<Search size={15} />}
        />
        <Select
          value={filters.assignType}
          onChange={setFilter('assignType')}
          placeholder={t('salesTeams.filters.allAssignTypes')}
          aria-label={t('salesTeams.rules.assignType')}
          options={ASSIGN_TYPES.map((type) => ({ value: type, label: t(`salesTeams.assignTypes.${type}.label`) }))}
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
        isLoading={data.rulesQuery.isLoading}
        error={data.rulesQuery.error}
        empty={data.rules.length === 0}
        emptyIcon={<GitBranch size={24} />}
        emptyTitle={t('salesTeams.rules.emptyTitle')}
        emptyDescription={t('salesTeams.rules.emptyDescription')}
        onRetry={data.rulesQuery.refetch}
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={<Search size={22} />}
            title={t('salesTeams.common.noResults')}
            action={<Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>{t('salesTeams.filters.clear')}</Button>}
          />
        ) : (
          <div className="grid gap-2">
            {rows.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                teamById={data.teamById}
                userById={data.userById}
                conditionLabels={conditionLabels}
                toggling={editor.togglingId === rule.id}
                onToggle={() => editor.toggleActive(rule)}
                onEdit={() => editor.open(rule)}
              />
            ))}
          </div>
        )}
      </ResourceState>
    </section>
  )
}
