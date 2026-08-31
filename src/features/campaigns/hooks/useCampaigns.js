import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campaignsApi } from '../api/campaignsApi'
import { campaignAdsApi as adsApi } from '../api/campaignAdsApi'
import { adsFormsApi } from '../api/adsFormsApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'

export function useCampaignLists() {
  const active = useQuery({
    queryKey: QUERY_KEYS.campaigns.active,
    queryFn: () => campaignsApi.getActiveCampaigns(),
    select: (data) => extractList(data, ['campaigns']),
  })
  const inactive = useQuery({
    queryKey: QUERY_KEYS.campaigns.inactive,
    queryFn: () => campaignsApi.getInactiveCampaigns(),
    select: (data) => extractList(data, ['campaigns']),
  })

  return { active, inactive, isLoading: active.isLoading || inactive.isLoading, error: active.error || inactive.error }
}

export function useAdsLists() {
  const active = useQuery({
    queryKey: ['ads', 'active'],
    queryFn: () => adsApi.getActiveAds(),
    select: (data) => extractList(data, ['ads']),
  })
  const inactive = useQuery({
    queryKey: ['ads', 'inactive'],
    queryFn: () => adsApi.getInactiveAds(),
    select: (data) => extractList(data, ['ads']),
  })
  const forms = useQuery({
    queryKey: ['ads-forms', 'active'],
    queryFn: () => adsFormsApi.getActiveAdsForms(),
    select: (data) => extractList(data, ['forms', 'ads_forms']),
  })

  return { active, inactive, forms }
}

export function useCampaignMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns.all })

  return {
    saveCampaign: useMutation({ mutationFn: campaignsApi.saveCampaign, onSuccess: invalidate }),
    updateCampaign: useMutation({
      mutationFn: ({ id, payload }) => campaignsApi.updateCampaign(id, payload),
      onSuccess: invalidate,
    }),
    saveAd: useMutation({ mutationFn: adsApi.saveAd, onSuccess: invalidate }),
    saveAdsForm: useMutation({ mutationFn: adsFormsApi.saveAdsForm, onSuccess: invalidate }),
  }
}
