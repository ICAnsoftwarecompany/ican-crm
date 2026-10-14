import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox, MailWarning, MessageCircle } from 'lucide-react'
import { buildDailySeries, filterByRange } from '../../../shared/components/reports'
import { useConversationUnreadSummary } from '../../conversations'
import { getConversationActivityDate } from './reportRows'

const CHANNELS = ['whatsapp', 'messenger', 'gmail']

/**
 * Customer conversations report (added 2026-10-01): unread and activity per channel, from the same
 * first page per channel the inbox tabs load (30 conversations each).
 */
export function useConversationsReport(range) {
  const { t } = useTranslation()
  const summary = useConversationUnreadSummary()

  return useMemo(() => {
    const channelLabel = (key) => t(`myWork.sections.messages.channels.${key}`)
    const tagged = CHANNELS.flatMap((channel) => (summary.lists[channel] || []).map((conversation) => ({ channel, conversation })))
    const inRange = filterByRange(tagged, (item) => getConversationActivityDate(item.conversation), range)
    const activeChannels = CHANNELS.filter((channel) => (summary.lists[channel] || []).length > 0).length

    const kpis = [
      { id: 'unread', icon: MailWarning, label: t('communication.reports.kpis.unreadMessages'), value: summary.counts.total, positiveIsGood: false },
      { id: 'active', icon: MessageCircle, label: t('communication.reports.kpis.activeConversations'), value: inRange.length },
      { id: 'channels', icon: Inbox, label: t('communication.reports.kpis.activeChannels'), value: activeChannels },
    ]

    const charts = [
      {
        id: 'activity-per-day',
        type: 'timeseries',
        size: 'wide',
        title: t('communication.reports.charts.conversationActivity'),
        data: buildDailySeries(tagged, (item) => getConversationActivityDate(item.conversation), { range, getSeries: (item) => item.channel, seriesKeys: CHANNELS }),
        series: CHANNELS.map((key) => ({ key, label: channelLabel(key) })),
      },
      {
        id: 'unread-by-channel',
        type: 'bar',
        title: t('communication.reports.charts.unreadByChannel'),
        data: CHANNELS.map((key) => ({ key, label: channelLabel(key), value: summary.counts[key] || 0 })),
        valueLabel: t('communication.reports.series.unread'),
      },
      {
        id: 'share-by-channel',
        type: 'share',
        title: t('communication.reports.charts.conversationsByChannel'),
        data: CHANNELS.map((key) => ({ key, label: channelLabel(key), value: inRange.filter((item) => item.channel === key).length })),
      },
    ]

    return { kpis, charts, recordCount: tagged.length, isLoading: summary.isLoading, error: summary.error, refetch: summary.refetch }
  }, [range, summary, t])
}
