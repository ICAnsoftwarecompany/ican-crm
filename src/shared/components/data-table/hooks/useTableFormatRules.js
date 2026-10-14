import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../../../store/authStore'
import { tableFormatRulesApi } from '../api/tableFormatRulesApi'
import { useTableFormatRulesRealtime } from '../../../../realtime'
import {
  buildFormatRulePayload,
  buildWholeTableFormatRulePayload,
  buildStylesFromFormatRules,
  findMatchingFormatRule,
  getFormatRuleVisibility,
} from '../utils/tableFormatRules'

function defaultGetRowKey(row, index) {
  if (row?.__rowKey !== undefined && row?.__rowKey !== null) return String(row.__rowKey)
  if (row?.id !== undefined && row?.id !== null) return String(row.id)
  if (row?._id !== undefined && row?._id !== null) return String(row._id)
  if (row?.uuid !== undefined && row?.uuid !== null) return String(row.uuid)
  return `row-${index}`
}

function normalizeRulesCache(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.rules)) return data.rules
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  return []
}

function normalizeMutationRules(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.rules)) return data.rules
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (data?.id) return [data]
  return []
}

function upsertRule(rules, rule) {
  const targetRule = (
    (rule?.id ? rules.find((item) => String(item.id) === String(rule.id)) : null) ||
    findMatchingFormatRule(rules, rule)
  )

  if (targetRule?.id) {
    return rules.map((item) => (
      String(item.id) === String(targetRule.id)
        ? {
          ...item,
          ...rule,
          id: rule.id || targetRule.id,
          style: rule.style || item.style,
          is_active: rule.is_active ?? item.is_active,
        }
        : item
    ))
  }

  return [
    ...rules,
    {
      id: `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...rule,
    },
  ]
}

export function useTableFormatRules(
  tableKey,
  rows = [],
  columns = [],
  getRowKey = defaultGetRowKey,
  activeVisibility = 'personal',
  options = {}
) {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const queryKey = ['data-table', 'format-rules', tableKey]
  const enabled = Boolean(isAuthenticated && tableKey)
  const realtime = useTableFormatRulesRealtime({
    tableKey,
    tenantId: options.tenantId,
    enabled: Boolean(enabled && options.realtime),
    showToast: options.showRealtimeToast !== false,
  })

  const rulesQuery = useQuery({
    queryKey,
    queryFn: () => tableFormatRulesApi.list(tableKey),
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  })

  const rules = useMemo(() => {
    return Array.isArray(rulesQuery.data) ? rulesQuery.data : []
  }, [rulesQuery.data])

  const visibleRules = useMemo(() => {
    return rules.filter((rule) => getFormatRuleVisibility(rule) === getFormatRuleVisibility({ visibility: activeVisibility }))
  }, [rules, activeVisibility])

  const serverStyles = useMemo(() => {
    if (!enabled) {
      return { rowStyles: {}, cellStyles: {}, columnStyles: {}, tableStyle: {} }
    }

    return buildStylesFromFormatRules(visibleRules, rows, columns, getRowKey)
  }, [enabled, visibleRules, rows, columns, getRowKey])

  const saveMutation = useMutation({
    mutationFn: async ({ scope, row, columnId, style, visibility = activeVisibility }) => {
      if ((scope === 'row' || scope === 'cell') && !row) return null
      if ((scope === 'cell' || scope === 'column') && !columnId) return null

      const payload = buildFormatRulePayload(
        {
          tableKey,
          scope,
          row,
          columnId,
          style,
          visibility,
        },
        columns
      )

      if (!Object.keys(payload.style).length) return null

      const existingRule = findMatchingFormatRule(rules, payload)
      if (existingRule?.id) {
        return tableFormatRulesApi.update(existingRule.id, {
          style: payload.style,
          is_active: true,
        })
      }

      return tableFormatRulesApi.create(payload)
    },
    onMutate: async ({ scope, row, columnId, style, visibility = activeVisibility }) => {
      if ((scope === 'row' || scope === 'cell') && !row) return null
      if ((scope === 'cell' || scope === 'column') && !columnId) return null

      const payload = buildFormatRulePayload(
        {
          tableKey,
          scope,
          row,
          columnId,
          style,
          visibility,
        },
        columns
      )

      if (!Object.keys(payload.style).length) return null

      await queryClient.cancelQueries({ queryKey })
      const previousRules = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (current) => {
        const currentRules = normalizeRulesCache(current)
        return upsertRule(currentRules, payload)
      })

      return { previousRules }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRules !== undefined) {
        queryClient.setQueryData(queryKey, context.previousRules)
      }
    },
    onSuccess: (result) => {
      const returnedRules = normalizeMutationRules(result)
      if (!returnedRules.length) return

      queryClient.setQueryData(queryKey, (current) => {
        return returnedRules.reduce(
          (rules, rule) => upsertRule(normalizeRulesCache(rules), rule),
          normalizeRulesCache(current)
        )
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ scope, row, columnId, visibility = activeVisibility }) => {
      if ((scope === 'row' || scope === 'cell') && !row) return null
      if ((scope === 'cell' || scope === 'column') && !columnId) return null

      const payload = buildFormatRulePayload(
        {
          tableKey,
          scope,
          row,
          columnId,
          style: { bgColor: '#000000' },
          visibility,
        },
        columns
      )
      const existingRule = findMatchingFormatRule(rules, payload)
      if (!existingRule?.id) return null
      return tableFormatRulesApi.remove(existingRule.id)
    },
    onMutate: async ({ scope, row, columnId, visibility = activeVisibility }) => {
      if ((scope === 'row' || scope === 'cell') && !row) return null
      if ((scope === 'cell' || scope === 'column') && !columnId) return null

      const payload = buildFormatRulePayload(
        {
          tableKey,
          scope,
          row,
          columnId,
          style: { bgColor: '#000000' },
          visibility,
        },
        columns
      )

      await queryClient.cancelQueries({ queryKey })
      const previousRules = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (current) => {
        const currentRules = normalizeRulesCache(current)
        const existingRule = findMatchingFormatRule(currentRules, payload)
        if (!existingRule?.id) return currentRules
        return currentRules.filter((rule) => rule.id !== existingRule.id)
      })

      return { previousRules }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRules !== undefined) {
        queryClient.setQueryData(queryKey, context.previousRules)
      }
    },
  })

  const saveTableMutation = useMutation({
    mutationFn: async ({ style, visibility = activeVisibility }) => {
      const payload = buildWholeTableFormatRulePayload({
        tableKey,
        style,
        visibility,
      })

      if (!Object.keys(payload.style).length) return null

      const existingRule = findMatchingFormatRule(rules, payload)
      if (existingRule?.id) {
        return tableFormatRulesApi.update(existingRule.id, {
          style: payload.style,
          is_active: true,
        })
      }

      return tableFormatRulesApi.create(payload)
    },
    onMutate: async ({ style, visibility = activeVisibility }) => {
      const payload = buildWholeTableFormatRulePayload({
        tableKey,
        style,
        visibility,
      })

      if (!Object.keys(payload.style).length) return null

      await queryClient.cancelQueries({ queryKey })
      const previousRules = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (current) => {
        const currentRules = normalizeRulesCache(current)
        return upsertRule(currentRules, payload)
      })

      return { previousRules }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRules !== undefined) {
        queryClient.setQueryData(queryKey, context.previousRules)
      }
    },
    onSuccess: (result) => {
      const returnedRules = normalizeMutationRules(result)
      if (!returnedRules.length) return

      queryClient.setQueryData(queryKey, (current) => {
        return returnedRules.reduce(
          (rules, rule) => upsertRule(normalizeRulesCache(rules), rule),
          normalizeRulesCache(current)
        )
      })
    },
  })

  const deleteTableMutation = useMutation({
    mutationFn: async ({ visibility = activeVisibility } = {}) => {
      const payload = buildWholeTableFormatRulePayload({
        tableKey,
        style: { bgColor: '#000000' },
        visibility,
      })
      const existingRule = findMatchingFormatRule(rules, payload)
      if (!existingRule?.id) return null
      return tableFormatRulesApi.remove(existingRule.id)
    },
    onMutate: async ({ visibility = activeVisibility } = {}) => {
      const payload = buildWholeTableFormatRulePayload({
        tableKey,
        style: { bgColor: '#000000' },
        visibility,
      })

      await queryClient.cancelQueries({ queryKey })
      const previousRules = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (current) => {
        const currentRules = normalizeRulesCache(current)
        const existingRule = findMatchingFormatRule(currentRules, payload)
        if (!existingRule?.id) return currentRules
        return currentRules.filter((rule) => String(rule.id) !== String(existingRule.id))
      })

      return { previousRules }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRules !== undefined) {
        queryClient.setQueryData(queryKey, context.previousRules)
      }
    },
  })

  const resetAllMutation = useMutation({
    mutationFn: async ({ visibilities = ['personal', 'shared'] } = {}) => {
      const visibilitySet = new Set(visibilities.map((visibility) => getFormatRuleVisibility({ visibility })))
      const rulesToDelete = rules.filter((rule) => (
        rule?.id && visibilitySet.has(getFormatRuleVisibility(rule))
      ))

      if (!rulesToDelete.length) return []

      return Promise.all(rulesToDelete.map((rule) => tableFormatRulesApi.remove(rule.id)))
    },
    onMutate: async ({ visibilities = ['personal', 'shared'] } = {}) => {
      const visibilitySet = new Set(visibilities.map((visibility) => getFormatRuleVisibility({ visibility })))

      await queryClient.cancelQueries({ queryKey })
      const previousRules = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (current) => {
        return normalizeRulesCache(current).filter((rule) => !visibilitySet.has(getFormatRuleVisibility(rule)))
      })

      return { previousRules }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRules !== undefined) {
        queryClient.setQueryData(queryKey, context.previousRules)
      }
    },
  })

  const saveFormatRule = useCallback(
    (input) => {
      if (!enabled) return
      saveMutation.mutate(input)
    },
    [enabled, saveMutation]
  )

  const deleteFormatRule = useCallback(
    (input) => {
      if (!enabled) return
      deleteMutation.mutate(input)
    },
    [enabled, deleteMutation]
  )

  const saveTableFormatRule = useCallback(
    (input) => {
      if (!enabled) return
      saveTableMutation.mutate(input)
    },
    [enabled, saveTableMutation]
  )

  const deleteTableFormatRule = useCallback(
    (input) => {
      if (!enabled) return
      deleteTableMutation.mutate(input)
    },
    [deleteTableMutation, enabled]
  )

  const resetAllFormatRules = useCallback(
    (input) => {
      if (!enabled) return
      resetAllMutation.mutate(input)
    },
    [enabled, resetAllMutation]
  )

  return {
    ...serverStyles,
    rules,
    visibleRules,
    isLoading: rulesQuery.isLoading,
    error: rulesQuery.error,
    realtimeConnectionStatus: realtime.connectionStatus,
    isSavingTableStyle: saveTableMutation.isPending || deleteTableMutation.isPending || resetAllMutation.isPending,
    saveFormatRule,
    deleteFormatRule,
    saveTableFormatRule,
    deleteTableFormatRule,
    resetAllFormatRules,
  }
}
