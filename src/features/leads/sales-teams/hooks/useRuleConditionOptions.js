import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { facebookCampaignApi, useAdsLists, useCampaignLists, useFacebookAdSets, useFacebookCampaigns } from '../../../campaigns'
import { useAuthStore } from '../../../../store/authStore'
import { resolveTenantId } from '../../../../services/tenantResolver'
import { extractRows, toAdOptions, toCampaignOptions, toFormOptions } from '../utils/ruleSources'

const MAX_AD_SETS = 25
const EMPTY = []

/**
 * Options for the rule conditions (2026-10-16): campaigns from the CRM and from Meta (Campaign Center), the ads of
 * the chosen campaign (CRM ads + the Meta ads of its ad sets) and lead forms. `form` = the rule form (stored ids
 * stay selectable; `campaign_id` drives the ad lists). Each list reports its own loading / error.
 */
export function useRuleConditionOptions(form) {
  const user = useAuthStore((state) => state.user)
  const tenantId = resolveTenantId(user)
  const crmCampaigns = useCampaignLists()
  const metaCampaigns = useFacebookCampaigns({ tenantId })
  const crmAds = useAdsLists()
  const campaignId = form.campaign_id || ''
  const adSetsQuery = useFacebookAdSets({ tenantId, campaignId })
  const adSets = (adSetsQuery.data || EMPTY).slice(0, MAX_AD_SETS)
  const adQueries = useQueries({
    queries: adSets.map((adSet) => ({
      queryKey: ['campaign-center', tenantId, 'meta', 'adset', String(adSet.id), 'ads'],
      queryFn: () => facebookCampaignApi.getAdSetAds(adSet.id),
      select: (response) => extractRows(response, ['ads']),
      enabled: Boolean(tenantId && adSet.id),
      retry: false,
    })),
  })

  const crmCampaignRows = [crmCampaigns.active.data, crmCampaigns.inactive.data]
  const metaCampaignRows = metaCampaigns.data
  const crmAdRows = [crmAds.active.data, crmAds.inactive.data]
  const formRows = crmAds.forms.data
  const adsKey = adQueries.map((query) => query.dataUpdatedAt).join(',')

  return useMemo(() => {
    const metaAdSets = adSets.map((adSet, index) => ({ adSet, ads: adQueries[index]?.data || EMPTY }))
    return {
      campaigns: {
        options: toCampaignOptions({ crm: crmCampaignRows.flat().filter(Boolean), meta: metaCampaignRows || EMPTY }, [form.campaign_id]),
        isLoading: crmCampaigns.isLoading || (Boolean(tenantId) && metaCampaigns.isLoading),
        error: crmCampaigns.error && metaCampaigns.error ? crmCampaigns.error : null,
        metaUnavailable: !tenantId || Boolean(metaCampaigns.error),
      },
      ads: {
        options: toAdOptions({ crm: crmAdRows.flat().filter(Boolean), metaAdSets }, campaignId, [form.ad_id]),
        isLoading: crmAds.active.isLoading || adSetsQuery.isLoading || adQueries.some((query) => query.isLoading),
        error: crmAds.active.error && crmAds.inactive.error ? crmAds.active.error : null,
        adSetCount: adSets.length,
      },
      forms: {
        options: toFormOptions({ crm: formRows || EMPTY }, [form.form_id]),
        isLoading: crmAds.forms.isLoading,
        error: crmAds.forms.error || null,
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.campaign_id, form.ad_id, form.form_id, tenantId, crmCampaigns.active.data, crmCampaigns.inactive.data, metaCampaignRows, crmAds.active.data, crmAds.inactive.data, formRows, adSetsQuery.data, adsKey,
    crmCampaigns.isLoading, metaCampaigns.isLoading, metaCampaigns.error, crmAds.active.isLoading, crmAds.forms.isLoading, adSetsQuery.isLoading])
}

const NO_FORM = { campaign_id: '', ad_id: '', form_id: '' }

/** id → name maps for showing rule conditions ("Campaign: Ramadan" instead of "#1"). */
export function useConditionLabels(form = NO_FORM) {
  const options = useRuleConditionOptions(form)
  return useMemo(() => {
    const toMap = (list) => new Map(list.filter((item) => !item.missing).map((item) => [item.value, item.label]))
    return { campaign_id: toMap(options.campaigns.options), ad_id: toMap(options.ads.options), form_id: toMap(options.forms.options) }
  }, [options.campaigns.options, options.ads.options, options.forms.options])
}
