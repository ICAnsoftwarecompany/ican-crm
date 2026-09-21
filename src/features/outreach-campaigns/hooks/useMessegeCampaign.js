import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messegeCampaignApi } from '../api/messegeCampaignApi'
import { whatsappTemplateImagesApi } from '../api/whatsappTemplateImagesApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'

export function useMessegeCampaigns(filters) {
  return useQuery({
    queryKey: QUERY_KEYS.messegeCampaigns.list(filters),
    queryFn: () => messegeCampaignApi.getCampaigns(filters),
  })
}

export function useMessegeCampaignInfo(campaignId, params) {
  return useQuery({
    queryKey: QUERY_KEYS.messegeCampaigns.detail(campaignId),
    queryFn: () => messegeCampaignApi.getCampaignInfo(campaignId, params),
    enabled: Boolean(campaignId),
  })
}


export function useScheduledMessegeCampaigns(filters) {
  return useQuery({
    queryKey: QUERY_KEYS.messegeCampaigns.scheduled(filters),
    queryFn: () => messegeCampaignApi.getScheduledCampaigns(filters),
  })
}

export function useMyMessegeCampaigns(filters) {
  return useQuery({
    queryKey: QUERY_KEYS.messegeCampaigns.my(filters),
    queryFn: () => messegeCampaignApi.getMyCampaigns(filters),
  })
}

export function useMyScheduledMessegeCampaigns(filters) {
  return useQuery({
    queryKey: QUERY_KEYS.messegeCampaigns.myScheduled(filters),
    queryFn: () => messegeCampaignApi.getMyScheduledCampaigns(filters),
  })
}

export function useMessegeCampaignMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messegeCampaigns.all })

  return {
    createCampaign: useMutation({
      mutationFn: messegeCampaignApi.createCampaign,
      onSuccess: invalidate,
    }),
    updateCampaign: useMutation({
      mutationFn: ({ campaignId, payload }) => messegeCampaignApi.updateCampaign(campaignId, payload),
      onSuccess: invalidate,
    }),
    deleteCampaign: useMutation({
      mutationFn: (campaignId) => messegeCampaignApi.deleteCampaign(campaignId),
      onSuccess: invalidate,
    }),
    cancelCampaign: useMutation({
      mutationFn: (campaignId) => messegeCampaignApi.cancelCampaign(campaignId),
      onSuccess: invalidate,
    }),
    addCampaignImages: useMutation({
      mutationFn: ({ campaignId, payload }) => messegeCampaignApi.addCampaignImages(campaignId, payload),
      onSuccess: invalidate,
    }),
    removeCampaignImages: useMutation({
      mutationFn: ({ campaignId, attachmentIds }) =>
        messegeCampaignApi.removeCampaignImages(campaignId, attachmentIds),
      onSuccess: invalidate,
    }),
    addCampaignCustomers: useMutation({
      mutationFn: ({ campaignId, customerIds }) =>
        messegeCampaignApi.addCampaignCustomers(campaignId, customerIds),
      onSuccess: invalidate,
    }),
    removeCampaignCustomers: useMutation({
      mutationFn: ({ campaignId, customerIds }) =>
        messegeCampaignApi.removeCampaignCustomers(campaignId, customerIds),
      onSuccess: invalidate,
    }),
    addCampaignUsers: useMutation({
      mutationFn: ({ campaignId, userIds }) => messegeCampaignApi.addCampaignUsers(campaignId, userIds),
      onSuccess: invalidate,
    }),
    removeCampaignUsers: useMutation({
      mutationFn: ({ campaignId, userIds }) => messegeCampaignApi.removeCampaignUsers(campaignId, userIds),
      onSuccess: invalidate,
    }),
  }
}

export function useWhatsappTemplateImages(filters) {
  return useQuery({
    queryKey: QUERY_KEYS.whatsappTemplateImages.list(filters),
    queryFn: () => whatsappTemplateImagesApi.getTemplateImages(filters),
  })
}

export function useWhatsappTemplateImagesData(templateId, params) {
  return useQuery({
    queryKey: QUERY_KEYS.whatsappTemplateImages.byTemplate(templateId),
    queryFn: () => whatsappTemplateImagesApi.getTemplateImagesData(templateId, params),
    enabled: Boolean(templateId),
  })
}

export function useWhatsappTemplateImageMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.whatsappTemplateImages.all })

  return {
    createTemplateImages: useMutation({
      mutationFn: whatsappTemplateImagesApi.createTemplateImages,
      onSuccess: invalidate,
    }),
    toggleTemplateImageStatus: useMutation({
      mutationFn: ({ templateId, isActive }) =>
        whatsappTemplateImagesApi.toggleTemplateImageStatus(templateId, isActive),
      onSuccess: invalidate,
    }),
  }
}
