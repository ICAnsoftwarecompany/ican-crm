import { useMemo } from 'react'
import {
  useMessegeCampaigns,
  useMessegeCampaignInfo,
  useScheduledMessegeCampaigns,
  useMyMessegeCampaigns,
  useMyScheduledMessegeCampaigns,
  useMessegeCampaignMutations,
  useWhatsappTemplateImages,
  useWhatsappTemplateImagesData,
  useWhatsappTemplateImageMutations,
} from './useMessegeCampaign'
import { normalizeCampaign, normalizeCampaignList } from '../utils/normalizeCampaign'

/**
 * Outreach-Campaigns-facing hook layer. Wraps the local API hooks, which
 * implement the documented campaign endpoints,
 * documented endpoint) and adds response normalization via
 * utils/normalizeCampaign.js, since the backend's real response shape is
 * unconfirmed and pages should never read raw API fields directly.
 */

export function useOutreachCampaigns(filters) {
  const query = useMessegeCampaigns(filters)
  const campaigns = useMemo(() => normalizeCampaignList(query.data), [query.data])
  return { ...query, campaigns }
}

export function useOutreachCampaign(campaignId, params) {
  const query = useMessegeCampaignInfo(campaignId, params)
  const campaign = useMemo(() => {
    if (!query.data) return null
    const entity = query.data?.data ?? query.data?.campaign ?? query.data
    return normalizeCampaign(entity)
  }, [query.data])
  return { ...query, campaign }
}

export {
  useScheduledMessegeCampaigns as useScheduledOutreachCampaigns,
  useMyMessegeCampaigns as useMyOutreachCampaigns,
  useMyScheduledMessegeCampaigns as useMyScheduledOutreachCampaigns,
  useMessegeCampaignMutations as useOutreachCampaignMutations,
  useWhatsappTemplateImages,
  useWhatsappTemplateImagesData,
  useWhatsappTemplateImageMutations,
}
