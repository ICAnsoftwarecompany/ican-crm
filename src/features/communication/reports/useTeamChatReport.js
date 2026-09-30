import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MailWarning, MessagesSquare, UsersRound } from 'lucide-react'
import { buildDailySeries, countBy, filterByRange } from '../../../shared/components/reports'
import { useChatConversations } from '../../internal-chat'
import { getConversationActivityDate, toChartRows } from './reportRows'

const isGroup = (conversation) => conversation?.type === 'group' || Number(conversation?.users_count || 0) > 2

/** Team chat report (added 2026-10-01) from the internal chat conversations list. */
export function useTeamChatReport(range) {
  const { t } = useTranslation()
  const query = useChatConversations()

  return useMemo(() => {
    const all = Array.isArray(query.data) ? query.data : []
    const inRange = filterByRange(all, getConversationActivityDate, range)
    const unread = all.reduce((sum, conversation) => sum + Number(conversation.unread_count || 0), 0)
    const unreadRows = [...all]
      .filter((conversation) => conversation.unread_count > 0)
      .sort((left, right) => right.unread_count - left.unread_count)
      .slice(0, 8)
      .map((conversation) => ({ key: String(conversation.id), label: conversation.display_name || `#${conversation.id}`, value: conversation.unread_count }))

    const kpis = [
      { id: 'active', icon: MessagesSquare, label: t('communication.reports.kpis.activeConversations'), value: inRange.length },
      { id: 'groups', icon: UsersRound, label: t('communication.reports.kpis.groups'), value: all.filter(isGroup).length },
      { id: 'unread', icon: MailWarning, label: t('communication.reports.kpis.unreadMessages'), value: unread, positiveIsGood: false },
    ]

    const charts = [
      {
        id: 'activity-per-day',
        type: 'timeseries',
        size: 'wide',
        title: t('communication.reports.charts.chatActivity'),
        data: buildDailySeries(all, getConversationActivityDate, { range }),
        series: [{ key: 'count', label: t('communication.reports.series.conversations') }],
        options: { variant: 'area' },
      },
      {
        id: 'by-type',
        type: 'share',
        title: t('communication.reports.charts.byConversationType'),
        data: toChartRows(countBy(all, (conversation) => (isGroup(conversation) ? 'group' : 'direct')), t, (key) => t(`communication.reports.conversationTypes.${key}`)),
      },
      {
        id: 'unread-by-conversation',
        type: 'bar',
        title: t('communication.reports.charts.unreadByConversation'),
        data: unreadRows,
        valueLabel: t('communication.reports.series.unread'),
        emptyText: t('communication.reports.noUnread'),
      },
    ]

    return { kpis, charts, recordCount: all.length, isLoading: query.isLoading, error: query.error, refetch: query.refetch }
  }, [query.data, query.error, query.isLoading, query.refetch, range, t])
}
