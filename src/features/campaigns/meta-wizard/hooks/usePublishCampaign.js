import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { facebookCampaignApi } from '../../facebook-campaign/api/facebookCampaignApi'
import { facebookCampaignKeys } from '../../facebook-campaign/hooks/useFacebookCampaigns'
import { metaWizardApi } from '../data/metaWizardApi'
import { WIZARD_PUBLISH_CAPABILITIES } from '../config/wizardCapabilities'
import { runPublishPlan } from '../publish/publishPlan'

const PUBLISH_API = {
  createCampaign: facebookCampaignApi.createCampaign,
  createAdSet: facebookCampaignApi.createAdSet,
  createAd: metaWizardApi.createAd,
  createLeadForm: metaWizardApi.createLeadForm,
}

/**
 * Runs the resumable publish plan and mirrors its progress into the
 * wizard state; the draft is saved after every step so remote ids survive
 * a reload and a retry never creates duplicates.
 */
export function usePublishCampaign({ getState, actions, persist, context }) {
  const queryClient = useQueryClient()
  const [running, setRunning] = useState(false)
  const lock = useRef(false)

  const publish = useCallback(async () => {
    if (lock.current) return null
    lock.current = true
    setRunning(true)
    try {
      const result = await runPublishPlan({
        state: getState(),
        api: PUBLISH_API,
        context,
        capabilities: WIZARD_PUBLISH_CAPABILITIES,
        onProgress: (publishState) => {
          actions.updatePublish(publishState)
          persist({ ...getState(), publish: publishState })
        },
      })
      if (result.campaignRemoteId) queryClient.invalidateQueries({ queryKey: facebookCampaignKeys.all(context.tenantId) })
      return result
    } finally {
      lock.current = false
      setRunning(false)
    }
  }, [actions, context, getState, persist, queryClient])

  return { publish, running }
}
