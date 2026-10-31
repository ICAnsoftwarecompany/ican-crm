import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { tasksApi, toBackendTaskableType } from '../tasks'
import { extractList } from '../../shared/utils/apiResponse'
import { indexLeadTasks } from './leadTaskDisplay'
import { LeadTasksCell } from './LeadTasksCell'

export function useLeadTasksIndex({ enabled = true } = {}) {
  const query = useQuery({
    queryKey: ['tasks', 'lead-task-index'], enabled, staleTime: 30000,
    queryFn: async ({ signal }) => {
      const tasks = new Map()
      for (let page = 1; ; page += 1) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
        const response = await tasksApi.getTasks({ taskable_type: toBackendTaskableType('lead'), per_page: 200, page })
        const rows = extractList(response, ['tasks', 'items'])
        rows.forEach((task) => tasks.set(String(task.id), task))
        const pagination = response?.data?.last_page != null ? response.data : response
        if (!rows.length || (!pagination?.next_page_url && (pagination?.last_page == null || page >= Number(pagination.last_page)))) break
      }
      return [...tasks.values()]
    },
  })
  const index = useMemo(() => indexLeadTasks(query.data || []), [query.data])
  return { ...query, index }
}

export function useLeadTasksColumn({ deal = false, enabled = true } = {}) {
  const { t } = useTranslation()
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(interval)
  }, [])
  const query = useLeadTasksIndex({ enabled })
  const { index } = query
  return useMemo(() => ({
    id: 'leadTasks', header: t('customers.leadTaskDisplay.column'),
    accessor: 'leadTasksCount', sortable: false, filterable: false,
    render: (row) => {
      const leadId = deal ? row.leadId : row.lead_id ?? row.lead?.id
      return <LeadTasksCell leadId={leadId} name={row.name || row.lead?.name} tasks={index.get(String(leadId)) || []} now={now} loading={query.isLoading} error={query.error} onRetry={query.refetch} />
    },
  }), [deal, index, now, query.isLoading, query.error, query.refetch, t])
}
