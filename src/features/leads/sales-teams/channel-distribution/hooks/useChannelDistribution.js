import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { channelDistributionApi } from '../api/channelDistributionApi'
import { extractRows } from '../../utils/ruleSources'
import { normalizeChannelRule, normalizeSetting } from '../utils/channelDistributionModel'

export const channelDistributionKeys = {
  all: ['channel-distribution'],
  settings: ['channel-distribution', 'settings'],
  rules: ['channel-distribution', 'rules'],
}

/** Distribution settings + user rules of every channel, normalized, with their mutations. */
export function useChannelDistribution() {
  const queryClient = useQueryClient()
  const settingsQuery = useQuery({
    queryKey: channelDistributionKeys.settings,
    queryFn: () => channelDistributionApi.getSettings(),
    select: (response) => extractRows(response, ['settings', 'distribution_settings']).map(normalizeSetting),
  })
  const rulesQuery = useQuery({
    queryKey: channelDistributionKeys.rules,
    queryFn: () => channelDistributionApi.getRules(),
    select: (response) => extractRows(response, ['rules', 'assignment_rules']).map(normalizeChannelRule),
  })
  const invalidate = (key) => () => queryClient.invalidateQueries({ queryKey: key })

  const mutations = {
    createSetting: useMutation({ mutationFn: channelDistributionApi.createSetting, onSuccess: invalidate(channelDistributionKeys.settings) }),
    updateSetting: useMutation({ mutationFn: ({ id, payload }) => channelDistributionApi.updateSetting(id, payload), onSuccess: invalidate(channelDistributionKeys.settings) }),
    deleteSetting: useMutation({ mutationFn: channelDistributionApi.deleteSetting, onSuccess: invalidate(channelDistributionKeys.settings) }),
    createRule: useMutation({ mutationFn: channelDistributionApi.createRule, onSuccess: invalidate(channelDistributionKeys.rules) }),
    updateRule: useMutation({ mutationFn: ({ id, payload }) => channelDistributionApi.updateRule(id, payload), onSuccess: invalidate(channelDistributionKeys.rules) }),
    deleteRule: useMutation({ mutationFn: channelDistributionApi.deleteRule, onSuccess: invalidate(channelDistributionKeys.rules) }),
  }

  const settings = useMemo(() => settingsQuery.data || [], [settingsQuery.data])
  const rules = useMemo(() => rulesQuery.data || [], [rulesQuery.data])
  return { settingsQuery, rulesQuery, settings, rules, mutations }
}
