import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { notificationsApi } from '../api/notificationsApi'
import { markNotificationsRead, mergeNotifications } from '../utils/notificationCache'
import { normalizeNotificationList } from '../utils/normalizeNotification'
import { prioritizeQuery, queryPolicyOptions } from '../../../shared/query/queryPolicy'

export function useUnreadNotifications(options = {}) {
  const { priority = 'background', ...queryOptions } = options
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: QUERY_KEYS.notifications.unread,
    queryFn: prioritizeQuery(async () => mergeNotifications(
      normalizeNotificationList(await notificationsApi.getUnread()),
      queryClient.getQueryData(QUERY_KEYS.notifications.unread) || []
    ), priority),
    staleTime: 30_000,
    ...queryPolicyOptions(priority, queryOptions),
  })
}

export function useNotificationHistory(options = {}) {
  const { priority = 'page', ...queryOptions } = options
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: QUERY_KEYS.notifications.history,
    queryFn: prioritizeQuery(async () => mergeNotifications(
      normalizeNotificationList(await notificationsApi.getHistory()),
      queryClient.getQueryData(QUERY_KEYS.notifications.history) || []
    ), priority),
    staleTime: 30_000,
    ...queryPolicyOptions(priority, queryOptions),
  })
}

function useReadMutation({ many = false } = {}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: many
      ? (ids) => notificationsApi.markManyRead(ids)
      : (id) => notificationsApi.markRead(id),
    onMutate: async (value) => {
      const ids = (many ? value : [value]).map(String)
      await Promise.all([
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications.unread }),
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications.history }),
      ])
      const previousUnread = queryClient.getQueryData(QUERY_KEYS.notifications.unread) || []
      const previousHistory = queryClient.getQueryData(QUERY_KEYS.notifications.history) || []
      const idSet = new Set(ids)
      queryClient.setQueryData(QUERY_KEYS.notifications.unread, previousUnread.filter((item) => !idSet.has(String(item.id))))
      queryClient.setQueryData(QUERY_KEYS.notifications.history, markNotificationsRead(previousHistory, ids))
      return { previousUnread, previousHistory }
    },
    onError: (_error, _value, context) => {
      queryClient.setQueryData(QUERY_KEYS.notifications.unread, context?.previousUnread || [])
      queryClient.setQueryData(QUERY_KEYS.notifications.history, context?.previousHistory || [])
      toast.error(t('notifications.errors.markRead'))
    },
  })
}

export function useMarkNotificationRead() {
  return useReadMutation()
}

export function useMarkNotificationsRead() {
  return useReadMutation({ many: true })
}
