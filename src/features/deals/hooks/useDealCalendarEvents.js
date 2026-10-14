import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalendarEvents } from '../../calendar'
import { buildDealMilestoneEvents, buildInstallmentEvents } from '../utils/dealCalendar'
import { getActivityDealLink, getTaskDealLink } from '../utils/dealLinks'
import { useDealLinkIndex } from './useDealLinkedWork'
import { useDealWorkspace } from './useDealWorkspace'

/**
 * Events of one deal: its tasks, calls and meetings (from the shared calendar sources, filtered by link),
 * plus contract installments and the deal's start/end dates.
 */
export function useDealCalendarEvents() {
  const { t } = useTranslation()
  const { deal } = useDealWorkspace()
  const { index, contracts, contractsQuery } = useDealLinkIndex()
  const calendar = useCalendarEvents()

  const events = useMemo(() => {
    const shared = calendar.events.filter((event) => (
      event.sourceId === 'tasks' ? getTaskDealLink(event.raw, index) : getActivityDealLink(event.raw, index)
    ))
    return [
      ...shared,
      ...buildInstallmentEvents(contracts, { installment: t('dealWorkspace.calendar.installment') }),
      ...buildDealMilestoneEvents(deal, { start: t('dealWorkspace.calendar.dealStart'), end: t('dealWorkspace.calendar.dealEnd') }),
    ]
  }, [calendar.events, contracts, deal, index, t])

  return {
    events,
    isLoading: calendar.isLoading || contractsQuery.isLoading,
    error: calendar.error || contractsQuery.error,
    refetch: () => {
      calendar.refetch()
      contractsQuery.refetch()
    },
  }
}
