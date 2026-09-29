import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { alertsApi } from '../api/alertsApi'
import { normalizeAlertList } from '../utils/normalizeAlert'
import { playAlertSound } from '../utils/alertSound'

export function useAlerts(options = {}) {
  const knownIds = useRef(null)
  const query = useQuery({
    queryKey: QUERY_KEYS.alerts.active,
    queryFn: async () => normalizeAlertList(await alertsApi.getActive()),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    ...options,
  })

  useEffect(() => {
    if (!query.data) return
    const currentIds = new Set(query.data.map((alert) => alert.id))
    if (knownIds.current === null) {
      knownIds.current = currentIds
      return
    }
    const newAlerts = query.data.filter((alert) => !knownIds.current.has(alert.id))
    if (newAlerts.length) playAlertSound(newAlerts[0])
    currentIds.forEach((id) => knownIds.current.add(id))
  }, [query.data])

  return query
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: alertsApi.acknowledge,
    onMutate: async (alertId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.alerts.active })
      const previous = queryClient.getQueryData(QUERY_KEYS.alerts.active) || []
      queryClient.setQueryData(QUERY_KEYS.alerts.active, previous.filter((alert) => String(alert.id) !== String(alertId)))
      return { previous }
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(QUERY_KEYS.alerts.active, context?.previous || [])
      toast.error(t('alerts.errors.acknowledge'))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts.active }),
  })
}
