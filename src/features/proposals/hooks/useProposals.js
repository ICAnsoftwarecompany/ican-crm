import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'
import { proposalsApi } from '../api/proposalsApi'

function extractEntity(response) {
  return response?.data?.data || response?.data || response || null
}

function invalidateProposalScopes(queryClient, proposalId) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.all })
  if (proposalId) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.detail(proposalId) })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.versions(proposalId) })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.options(proposalId) })
  }
}

export function useProposals(params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.list(params),
    queryFn: () => proposalsApi.getProposals(params),
    select: (data) => extractList(data, ['data', 'proposals', 'items']),
    ...options,
  })
}

export function useProposalInfo(proposalId, params, options = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.proposals.detail(proposalId), params],
    queryFn: () => proposalsApi.getProposalInfo(proposalId, params),
    enabled: Boolean(proposalId) && (options.enabled ?? true),
    select: extractEntity,
    ...options,
  })
}

export function useProposalVersions(proposalId, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.versions(proposalId, params),
    queryFn: () => proposalsApi.getProposalVersions(proposalId, params),
    enabled: Boolean(proposalId) && (options.enabled ?? true),
    select: (data) => extractList(data, ['data', 'versions', 'items']),
    ...options,
  })
}

export function useProposalVersionInfo(proposalId, versionId, params, options = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.proposals.version(proposalId, versionId), params],
    queryFn: () => proposalsApi.getProposalVersionInfo(proposalId, versionId, params),
    enabled: Boolean(proposalId && versionId) && (options.enabled ?? true),
    select: extractEntity,
    ...options,
  })
}

export function useProposalOptions(proposalId, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.options(proposalId, params),
    queryFn: () => proposalsApi.getProposalOptions(proposalId, params),
    enabled: Boolean(proposalId) && (options.enabled ?? true),
    select: (data) => extractList(data, ['data', 'options', 'items']),
    ...options,
  })
}

export function useProposalOptionItems(proposalId, optionId, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.optionItems(proposalId, optionId, params),
    queryFn: () => proposalsApi.getProposalOptionItems(proposalId, optionId, params),
    enabled: Boolean(proposalId && optionId) && (options.enabled ?? true),
    select: (data) => extractList(data, ['data', 'items']),
    ...options,
  })
}

export function useProposalMutations() {
  const queryClient = useQueryClient()

  const invalidateProposal = (proposalId) => invalidateProposalScopes(queryClient, proposalId)
  const invalidateAll = () => invalidateProposalScopes(queryClient)
  const invalidateOptionItems = (proposalId, optionId) => {
    invalidateProposal(proposalId)
    if (proposalId && optionId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.proposals.optionItems(proposalId, optionId),
      })
    }
  }

  return {
    createProposal: useMutation({
      mutationFn: proposalsApi.createProposal,
      onSuccess: invalidateAll,
    }),

    updateProposal: useMutation({
      mutationFn: ({ proposalId, payload }) => proposalsApi.updateProposal(proposalId, payload),
      onSuccess: (_data, variables = {}) => invalidateProposal(variables.proposalId),
    }),

    deleteProposal: useMutation({
      mutationFn: proposalsApi.deleteProposal,
      onSuccess: invalidateAll,
    }),

    createProposalVersion: useMutation({
      mutationFn: ({ proposalId, payload }) => proposalsApi.createProposalVersion(proposalId, payload),
      onSuccess: (_data, variables = {}) => invalidateProposal(variables.proposalId),
    }),

    updateProposalVersion: useMutation({
      mutationFn: ({ proposalId, versionId, payload }) => (
        proposalsApi.updateProposalVersion(proposalId, versionId, payload)
      ),
      onSuccess: (_data, variables = {}) => invalidateProposal(variables.proposalId),
    }),

    deleteProposalVersion: useMutation({
      mutationFn: ({ proposalId, versionId }) => proposalsApi.deleteProposalVersion(proposalId, versionId),
      onSuccess: (_data, variables = {}) => invalidateProposal(variables.proposalId),
    }),

    setCurrentProposalVersion: useMutation({
      mutationFn: ({ proposalId, versionId }) => proposalsApi.setCurrentProposalVersion(proposalId, versionId),
      onSuccess: (_data, variables = {}) => invalidateProposal(variables.proposalId),
    }),

    createProposalOption: useMutation({
      mutationFn: ({ proposalId, payload }) => proposalsApi.createProposalOption(proposalId, payload),
      onSuccess: (_data, variables = {}) => invalidateProposal(variables.proposalId),
    }),

    reorderProposalOptions: useMutation({
      mutationFn: ({ proposalId, options, payload }) => proposalsApi.reorderProposalOptions(proposalId, payload || options),
      onSuccess: (_data, variables = {}) => invalidateProposal(variables.proposalId),
    }),

    updateProposalOption: useMutation({
      mutationFn: ({ proposalId, optionId, payload }) => (
        proposalsApi.updateProposalOption(proposalId, optionId, payload)
      ),
      onSuccess: (_data, variables = {}) => invalidateProposal(variables.proposalId),
    }),

    setRecommendedProposalOption: useMutation({
      mutationFn: ({ proposalId, optionId, payload }) => (
        proposalsApi.setRecommendedProposalOption(proposalId, optionId, payload)
      ),
      onSuccess: (_data, variables = {}) => invalidateProposal(variables.proposalId),
    }),

    deleteProposalOption: useMutation({
      mutationFn: ({ proposalId, optionId }) => proposalsApi.deleteProposalOption(proposalId, optionId),
      onSuccess: (_data, variables = {}) => invalidateProposal(variables.proposalId),
    }),

    createProposalOptionItem: useMutation({
      mutationFn: ({ proposalId, optionId, payload }) => (
        proposalsApi.createProposalOptionItem(proposalId, optionId, payload)
      ),
      onSuccess: (_data, variables = {}) => invalidateOptionItems(variables.proposalId, variables.optionId),
    }),

    reorderProposalOptionItems: useMutation({
      mutationFn: ({ proposalId, optionId, items, payload }) => (
        proposalsApi.reorderProposalOptionItems(proposalId, optionId, payload || items)
      ),
      onSuccess: (_data, variables = {}) => invalidateOptionItems(variables.proposalId, variables.optionId),
    }),

    updateProposalOptionItem: useMutation({
      mutationFn: ({ proposalId, optionId, itemId, payload }) => (
        proposalsApi.updateProposalOptionItem(proposalId, optionId, itemId, payload)
      ),
      onSuccess: (_data, variables = {}) => invalidateOptionItems(variables.proposalId, variables.optionId),
    }),

    deleteProposalOptionItem: useMutation({
      mutationFn: ({ proposalId, optionId, itemId }) => (
        proposalsApi.deleteProposalOptionItem(proposalId, optionId, itemId)
      ),
      onSuccess: (_data, variables = {}) => invalidateOptionItems(variables.proposalId, variables.optionId),
    }),
  }
}
