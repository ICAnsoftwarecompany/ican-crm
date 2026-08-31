import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/authStore'
import { resolveTenantId } from '../../services/tenantResolver'
import { useRealtimeChannel } from './useRealtimeChannel'

function upsertRule(rules = [], rule) {
  if (!rule?.id) return rules

  const exists = rules.some((item) => item.id === rule.id)
  if (!exists) return [...rules, rule]

  return rules.map((item) => (item.id === rule.id ? { ...item, ...rule } : item))
}

function applyRealtimeRuleChange(rules = [], action, rule) {
  if (!rule?.id) return rules

  switch (action) {
    case 'created':
    case 'updated':
    case 'toggled':
      return upsertRule(rules, rule)
    case 'deleted':
      return rules.filter((item) => item.id !== rule.id)
    default:
      return rules
  }
}

export function useTableFormatRulesRealtime({
  tableKey,
  tenantId = '',
  enabled = true,
  showToast = true,
}) {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const resolvedTenantId = useMemo(
    () => resolveTenantId(user, tenantId),
    [user, tenantId]
  )

  const queryKey = useMemo(() => ['data-table', 'format-rules', tableKey], [tableKey])
  const channelName = useMemo(() => {
    if (!resolvedTenantId || !tableKey) return ''
    return `tenant.${resolvedTenantId}.table-format-rules.${tableKey}`
  }, [resolvedTenantId, tableKey])

  const handleRuleChanged = useCallback(
    (payload = {}) => {
      const { action, rule } = payload

      queryClient.setQueryData(queryKey, (current) => {
        if (!Array.isArray(current)) return current
        return applyRealtimeRuleChange(current, action, rule)
      })

      if (showToast && (rule?.visibility || payload.visibility) === 'shared') {
        toast.info('تم تحديث إعدادات جدول مشتركة', {
          description: 'تم تطبيق التغيير اللحظي على الجدول المفتوح.',
        })
      }
    },
    [queryClient, queryKey, showToast]
  )

  return useRealtimeChannel({
    channelName,
    eventName: '.rule.changed',
    enabled: Boolean(enabled && resolvedTenantId && tableKey),
    isPrivate: true,
    onEvent: handleRuleChanged,
  })
}
