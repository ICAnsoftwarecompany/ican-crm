import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs } from '../../../../shared/components/ui/Tabs'
import { EntityTasksPanel } from '../../../tasks'
import { useDealTasks } from '../../hooks/useDealLinkedWork'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { DealTodoQuickAdd } from './DealTodoQuickAdd'
import { LinkedTaskList } from './LinkedTaskList'

/**
 * All the work of a deal in one place:
 * - Deal tasks & To-Dos: linked to the deal itself (internal team work).
 * - Lead follow-ups: tasks on the deal's leads (calls, follow-ups created from the board or the customer drawer).
 * - Contract follow-ups: the tasks the won flow creates (delivery start, installment reminders).
 */
export function DealTasksPanel() {
  const { t } = useTranslation()
  const { dealId, deal } = useDealWorkspace()
  const { groups, isLoading, error, refetch } = useDealTasks()
  const [tab, setTab] = useState('deal')
  const common = { isLoading, error, onRetry: refetch }

  return (
    <Tabs
      variant="underline"
      active={tab}
      onChange={setTab}
      items={[
        {
          id: 'deal',
          label: t('dealWorkspace.tasks.tabs.deal'),
          content: (
            <div className="space-y-3">
              <DealTodoQuickAdd dealId={dealId} />
              <EntityTasksPanel taskable={{ type: 'deal', id: dealId, name: deal?.name }} layoutMode="wide" />
            </div>
          ),
        },
        {
          id: 'leads',
          label: t('dealWorkspace.tasks.tabs.leads', { count: groups.lead.length }),
          content: <LinkedTaskList tasks={groups.lead} {...common} emptyTitle={t('dealWorkspace.tasks.leadsEmpty')} emptyDescription={t('dealWorkspace.tasks.leadsEmptyHint')} />,
        },
        {
          id: 'contracts',
          label: t('dealWorkspace.tasks.tabs.contracts', { count: groups.contract.length }),
          content: <LinkedTaskList tasks={groups.contract} {...common} emptyTitle={t('dealWorkspace.tasks.contractsEmpty')} emptyDescription={t('dealWorkspace.tasks.contractsEmptyHint')} />,
        },
      ]}
    />
  )
}
