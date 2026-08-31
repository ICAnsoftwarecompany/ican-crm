import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'
import { proposalTemplatesApi } from '../api/proposalTemplatesApi'

function extractEntity(response) {
  return response?.data?.data || response?.data || response || null
}

export function useProposalTemplates(params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.proposalTemplates.list(params),
    queryFn: () => proposalTemplatesApi.getTemplates(params),
    select: (data) => extractList(data, ['data', 'templates', 'items']),
    ...options,
  })
}

export function useProposalTemplateInfo(templateId, params, options = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.proposalTemplates.detail(templateId), params],
    queryFn: () => proposalTemplatesApi.getTemplateInfo(templateId, params),
    enabled: Boolean(templateId) && (options.enabled ?? true),
    select: extractEntity,
    ...options,
  })
}

export function useProposalTemplateMutations() {
  const queryClient = useQueryClient()

  const invalidateTemplates = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposalTemplates.all })
  }

  const invalidateTemplate = (templateId) => {
    invalidateTemplates()
    if (templateId) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposalTemplates.detail(templateId) })
    }
  }

  const invalidateVersion = (versionId) => {
    invalidateTemplates()
    if (versionId) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposalTemplates.version(versionId) })
    }
  }

  const invalidateSection = (sectionId) => {
    invalidateTemplates()
    if (sectionId) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposalTemplates.section(sectionId) })
    }
  }

  return {
    createTemplate: useMutation({
      mutationFn: proposalTemplatesApi.createTemplate,
      onSuccess: invalidateTemplates,
    }),

    updateTemplate: useMutation({
      mutationFn: ({ templateId, payload }) => proposalTemplatesApi.updateTemplate(templateId, payload),
      onSuccess: (_data, variables = {}) => invalidateTemplate(variables.templateId),
    }),

    deleteTemplate: useMutation({
      mutationFn: proposalTemplatesApi.deleteTemplate,
      onSuccess: invalidateTemplates,
    }),

    duplicateTemplate: useMutation({
      mutationFn: proposalTemplatesApi.duplicateTemplate,
      onSuccess: invalidateTemplates,
    }),

    activateTemplate: useMutation({
      mutationFn: proposalTemplatesApi.activateTemplate,
      onSuccess: (_data, templateId) => invalidateTemplate(templateId),
    }),

    deactivateTemplate: useMutation({
      mutationFn: proposalTemplatesApi.deactivateTemplate,
      onSuccess: (_data, templateId) => invalidateTemplate(templateId),
    }),

    createTemplateVersion: useMutation({
      mutationFn: ({ templateId, payload }) => proposalTemplatesApi.createTemplateVersion(templateId, payload),
      onSuccess: (_data, variables = {}) => invalidateTemplate(variables.templateId),
    }),

    updateVersionBuilder: useMutation({
      mutationFn: ({ versionId, payload }) => proposalTemplatesApi.updateVersionBuilder(versionId, payload),
      onSuccess: (_data, variables = {}) => invalidateVersion(variables.versionId),
    }),

    setCurrentVersion: useMutation({
      mutationFn: proposalTemplatesApi.setCurrentVersion,
      onSuccess: (_data, versionId) => invalidateVersion(versionId),
    }),

    duplicateVersion: useMutation({
      mutationFn: proposalTemplatesApi.duplicateVersion,
      onSuccess: invalidateTemplates,
    }),

    createVersionSection: useMutation({
      mutationFn: ({ versionId, payload }) => proposalTemplatesApi.createVersionSection(versionId, payload),
      onSuccess: (_data, variables = {}) => invalidateVersion(variables.versionId),
    }),

    reorderVersionSections: useMutation({
      mutationFn: ({ versionId, sectionIds, payload }) => (
        proposalTemplatesApi.reorderVersionSections(versionId, payload || sectionIds)
      ),
      onSuccess: (_data, variables = {}) => invalidateVersion(variables.versionId),
    }),

    updateSection: useMutation({
      mutationFn: ({ sectionId, payload }) => proposalTemplatesApi.updateSection(sectionId, payload),
      onSuccess: (_data, variables = {}) => invalidateSection(variables.sectionId),
    }),

    deleteSection: useMutation({
      mutationFn: proposalTemplatesApi.deleteSection,
      onSuccess: invalidateTemplates,
    }),

    toggleSectionVisibility: useMutation({
      mutationFn: proposalTemplatesApi.toggleSectionVisibility,
      onSuccess: (_data, sectionId) => invalidateSection(sectionId),
    }),

    createSectionBlock: useMutation({
      mutationFn: ({ sectionId, payload }) => proposalTemplatesApi.createSectionBlock(sectionId, payload),
      onSuccess: (_data, variables = {}) => invalidateSection(variables.sectionId),
    }),

    reorderSectionBlocks: useMutation({
      mutationFn: ({ sectionId, blockIds, payload }) => (
        proposalTemplatesApi.reorderSectionBlocks(sectionId, payload || blockIds)
      ),
      onSuccess: (_data, variables = {}) => invalidateSection(variables.sectionId),
    }),

    updateBlock: useMutation({
      mutationFn: ({ blockId, payload }) => proposalTemplatesApi.updateBlock(blockId, payload),
      onSuccess: invalidateTemplates,
    }),

    deleteBlock: useMutation({
      mutationFn: proposalTemplatesApi.deleteBlock,
      onSuccess: invalidateTemplates,
    }),

    toggleBlockVisibility: useMutation({
      mutationFn: proposalTemplatesApi.toggleBlockVisibility,
      onSuccess: invalidateTemplates,
    }),
  }
}
