import { useMemo } from 'react'
import { useAdsLists, useCampaignLists } from '../../../campaigns'
import { normalizeId } from '../utils/teamModel'

const labelOf = (item) => item?.name || item?.title || item?.campaign_name || item?.ad_name || item?.form_name || `#${item?.id}`

function toOptions(lists, extraIds = []) {
  const seen = new Map()
  lists.flat().forEach((item) => {
    const id = normalizeId(item?.id)
    if (id && !seen.has(id)) seen.set(id, { value: id, label: labelOf(item), campaignId: normalizeId(item.campaign_id ?? item.campaign) })
  })
  // Keep a stored id selectable even when it is no longer in the active / inactive lists.
  extraIds.filter(Boolean).forEach((id) => {
    if (!seen.has(id)) seen.set(id, { value: id, label: `#${id}`, campaignId: '' })
  })
  return [...seen.values()]
}

/**
 * Options for the rule conditions: CRM campaigns, ads (narrowed to the chosen campaign when the ad carries a
 * campaign_id) and lead forms. `form` = the rule form, so stored ids stay selectable.
 */
export function useRuleConditionOptions(form, enabled = true) {
  const campaigns = useCampaignLists()
  const ads = useAdsLists()
  const campaignData = [campaigns.active.data || [], campaigns.inactive.data || []]
  const adData = [ads.active.data || [], ads.inactive.data || []]
  const formData = ads.forms.data || []

  return useMemo(() => {
    if (!enabled) return { campaigns: [], ads: [], forms: [], isLoading: false }
    const allAds = toOptions(adData, [form.ad_id])
    const narrowed = form.campaign_id ? allAds.filter((ad) => !ad.campaignId || ad.campaignId === form.campaign_id || ad.value === form.ad_id) : allAds
    return {
      campaigns: toOptions(campaignData, [form.campaign_id]),
      ads: narrowed,
      forms: toOptions([formData], [form.form_id]),
      isLoading: campaigns.isLoading || ads.active.isLoading || ads.forms.isLoading,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, form.campaign_id, form.ad_id, form.form_id, campaigns.active.data, campaigns.inactive.data, ads.active.data, ads.inactive.data, ads.forms.data, campaigns.isLoading, ads.active.isLoading, ads.forms.isLoading])
}

const NO_FORM = { campaign_id: '', ad_id: '', form_id: '' }

/** id → name maps for showing rule conditions ("Campaign: Ramadan" instead of "#1"). */
export function useConditionLabels() {
  const options = useRuleConditionOptions(NO_FORM)
  return useMemo(() => {
    const toMap = (list) => new Map(list.map((item) => [item.value, item.label]))
    return { campaign_id: toMap(options.campaigns), ad_id: toMap(options.ads), form_id: toMap(options.forms) }
  }, [options.campaigns, options.ads, options.forms])
}
