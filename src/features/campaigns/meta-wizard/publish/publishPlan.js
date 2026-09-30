import { WIZARD_PUBLISH_CAPABILITIES } from '../config/wizardCapabilities'
import { buildAdPayload, buildAdSetPayload, buildCampaignPayload, buildLeadFormPayload } from '../domain/buildMetaPayloads'

// Publishing is a resumable, ordered plan:
//   campaign → each ad set → (lead form) → each ad
// Remote ids are written back into the draft after every step, so a
// failure half-way never creates duplicates: retrying skips what exists.

export function extractRemoteId(response, keys = ['id']) {
  const candidates = [response?.data?.data, response?.data, response]
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue
    for (const key of keys) if (candidate[key]) return String(candidate[key])
  }
  return null
}

export function buildPublishPlan(state, capabilities = WIZARD_PUBLISH_CAPABILITIES) {
  const publish = state.publish || {}
  const steps = [{ id: 'campaign', kind: 'campaign', done: Boolean(publish.campaignRemoteId) }]
  for (const adSet of state.adSets) {
    steps.push({ id: `adset:${adSet.id}`, kind: 'adSet', adSetId: adSet.id, done: Boolean(publish.adSetRemoteIds?.[adSet.id]) })
    for (const ad of adSet.ads) {
      const pendingApi = !capabilities.createAds || (ad.leadForm?.mode === 'new' && adSet.conversionLocation === 'instant_form' && !capabilities.createLeadForms)
      steps.push({ id: `ad:${ad.id}`, kind: 'ad', adSetId: adSet.id, adId: ad.id, done: Boolean(publish.adRemoteIds?.[ad.id]), pendingApi })
    }
  }
  return steps
}

export async function runPublishPlan({ state, api, context, capabilities = WIZARD_PUBLISH_CAPABILITIES, onProgress }) {
  const publish = {
    ...state.publish,
    adSetRemoteIds: { ...state.publish?.adSetRemoteIds },
    adRemoteIds: { ...state.publish?.adRemoteIds },
    leadFormRemoteIds: { ...state.publish?.leadFormRemoteIds },
    status: 'running',
    failedStepId: null,
    lastError: null,
  }
  const emit = (patch = {}) => {
    Object.assign(publish, patch)
    onProgress?.({ ...publish })
  }
  emit()

  const steps = buildPublishPlan(state, capabilities)
  const pendingAdIds = []
  for (const step of steps) {
    if (step.done) continue
    if (step.kind === 'ad' && step.pendingApi) {
      pendingAdIds.push(step.adId)
      continue
    }
    emit({ currentStepId: step.id })
    try {
      if (step.kind === 'campaign') {
        const response = await api.createCampaign(buildCampaignPayload(state, context))
        const id = extractRemoteId(response, ['campaign_id', 'id'])
        if (!id) throw Object.assign(new Error('missingCampaignId'), { code: 'missingCampaignId' })
        emit({ campaignRemoteId: id })
      } else if (step.kind === 'adSet') {
        const adSet = state.adSets.find((item) => item.id === step.adSetId)
        const response = await api.createAdSet(buildAdSetPayload(state, adSet, { ...context, campaignRemoteId: publish.campaignRemoteId }))
        const id = extractRemoteId(response, ['adset_id', 'id'])
        if (!id) throw Object.assign(new Error('missingAdSetId'), { code: 'missingAdSetId' })
        emit({ adSetRemoteIds: { ...publish.adSetRemoteIds, [adSet.id]: id } })
      } else if (step.kind === 'ad') {
        const adSet = state.adSets.find((item) => item.id === step.adSetId)
        const ad = adSet.ads.find((item) => item.id === step.adId)
        let leadFormRemoteId = publish.leadFormRemoteIds[ad.id]
        const leadFormPayload = adSet.conversionLocation === 'instant_form' ? buildLeadFormPayload(ad, { pageId: ad.identity?.pageId || state.campaign.pageId }) : undefined
        if (leadFormPayload && !leadFormRemoteId) {
          leadFormRemoteId = extractRemoteId(await api.createLeadForm(leadFormPayload), ['form_id', 'id'])
          emit({ leadFormRemoteIds: { ...publish.leadFormRemoteIds, [ad.id]: leadFormRemoteId } })
        }
        const response = await api.createAd(buildAdPayload(state, adSet, ad, { ...context, adSetRemoteId: publish.adSetRemoteIds[adSet.id], leadFormRemoteId }))
        const id = extractRemoteId(response, ['ad_id', 'id'])
        if (!id) throw Object.assign(new Error('missingAdId'), { code: 'missingAdId' })
        emit({ adRemoteIds: { ...publish.adRemoteIds, [ad.id]: id } })
      }
    } catch (error) {
      emit({ status: 'failed', failedStepId: step.id, currentStepId: null, lastError: serializeError(error), pendingAdIds })
      return { ...publish }
    }
  }

  emit({ status: pendingAdIds.length ? 'partial' : 'done', currentStepId: null, pendingAdIds, finishedAt: new Date().toISOString() })
  return { ...publish }
}

function serializeError(error) {
  const errors = error?.response?.data?.errors
  const validation = errors && typeof errors === 'object' ? Object.values(errors).flat().filter(Boolean) : []
  return {
    code: error?.code && typeof error.code === 'string' && !error.response ? error.code : null,
    message: validation[0] || error?.response?.data?.message || error?.response?.data?.error?.message || error?.message || '',
    details: validation.slice(1, 5),
    status: error?.response?.status || null,
  }
}
