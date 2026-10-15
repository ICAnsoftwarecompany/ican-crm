import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from '../../../shared/components/data-table/hooks/useLocalStorage'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { dealCampaignsApi, dealLeadsApi, dealResourcesApi, dealsApi, pipelineTemplatesApi } from '../api'
import { dealKeys } from '../constants/dealQueryKeys'
import { WIZARD_STEPS, buildWizardRequests, extractCreatedId, firstInvalidStepBefore, withWizardDefaults } from '../utils/dealWizard'
import { buildNewLeadPayload } from '../utils/leadSource'

const DRAFT_KEY = 'deals:create-wizard:draft'
const EMPTY_CREATED = { templateId: null, dealId: null, teamDone: false, productsDone: false, campaignsDone: false, existingLeadsDone: false, newLeadKeys: [] }

/**
 * State + submission of the "new deal" wizard. The draft (answers + what was already created) lives in
 * localStorage, so a reload or a failed request never loses the answers and never creates a second deal:
 * a retry continues from the request that failed. New leads are sent one by one; a lead the backend refuses does
 * not stop the others — they are listed (`error.failed`) and a retry sends only them, or `finishWithoutFailed`
 * opens the deal without them.
 */
export function useDealCreateWizard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const client = useQueryClient()
  const stageNames = useMemo(() => [0, 1, 2, 3].map((index) => t(`dealWorkspace.wizard.pipeline.defaultStages.${index}`)), [t])
  const [draft, setDraft] = useLocalStorage(DRAFT_KEY, null)
  const state = useMemo(() => withWizardDefaults(draft?.state, stageNames), [draft?.state, stageNames])
  const created = useMemo(() => ({ ...EMPTY_CREATED, ...(draft?.created || {}) }), [draft?.created])
  const [step, setStep] = useState(() => (draft?.step && WIZARD_STEPS.includes(draft.step) ? draft.step : 'pipeline'))
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState({})
  const [error, setError] = useState(null)

  const save = useCallback((nextState, nextCreated = created, nextStep = step) => {
    setDraft({ state: nextState, created: nextCreated, step: nextStep })
  }, [created, setDraft, step])

  const update = useCallback((section, patch) => {
    save({ ...state, [section]: { ...state[section], ...(typeof patch === 'function' ? patch(state[section]) : patch) } })
  }, [save, state])

  const goTo = useCallback((nextStep) => {
    setStep(nextStep)
    save(state, created, nextStep)
  }, [created, save, state])

  const reset = useCallback(() => {
    setDraft(null)
    setStep('pipeline')
    setProgress({})
    setError(null)
  }, [setDraft])

  const submit = useCallback(async () => {
    const invalid = firstInvalidStepBefore('review', state)
    if (invalid) {
      goTo(invalid)
      return
    }
    const requests = buildWizardRequests(state)
    const done = { ...EMPTY_CREATED, ...created }
    const mark = (key, value) => setProgress((current) => ({ ...current, [key]: value }))
    const persist = () => setDraft({ state, created: { ...done }, step: 'review' })
    setSubmitting(true)
    setError(null)
    let phase = 'template'
    try {
      if (requests.template && !done.templateId) {
        mark('template', 'running')
        done.templateId = extractCreatedId(await pipelineTemplatesApi.create(requests.template), 'template')
        if (!done.templateId) throw new Error(t('dealWorkspace.wizard.review.noTemplateId'))
        persist()
      }
      mark('template', 'done')

      phase = 'deal'
      if (!done.dealId) {
        mark('deal', 'running')
        done.dealId = extractCreatedId(await dealsApi.create(requests.deal(done.templateId || state.pipeline.templateId)), 'deal')
        if (!done.dealId) throw new Error(t('dealWorkspace.wizard.review.noDealId'))
        persist()
      }
      mark('deal', 'done')

      // The whole team in one request (users + ready teams). `teamDone === true` once it went through.
      phase = 'team'
      const team = requests.team(done.dealId)
      if (team && done.teamDone !== true) {
        mark('team', 'running')
        await dealResourcesApi.addTeamMembers(team)
        done.teamDone = true
        persist()
      }
      mark('team', 'done')

      phase = 'products'
      const products = requests.products(done.dealId)
      if (products && !done.productsDone) {
        mark('products', 'running')
        await dealResourcesApi.addProducts(products)
        done.productsDone = true
        persist()
      }
      mark('products', 'done')

      // Lead source: linked campaigns, or CRM leads (one request) + new leads (one request each).
      phase = 'campaigns'
      const campaigns = requests.campaigns()
      if (campaigns && !done.campaignsDone) {
        mark('campaigns', 'running')
        await dealCampaignsApi.attach(done.dealId, campaigns)
        done.campaignsDone = true
        persist()
      }
      mark('campaigns', 'done')

      phase = 'existingLeads'
      const existingLeads = requests.existingLeads(done.dealId)
      if (existingLeads && !done.existingLeadsDone) {
        mark('existingLeads', 'running')
        await dealLeadsApi.addExisting(existingLeads)
        done.existingLeadsDone = true
        persist()
      }
      mark('existingLeads', 'done')

      phase = 'newLeads'
      const failed = []
      const pending = requests.newLeads.filter((row) => !done.newLeadKeys.includes(row.key))
      if (pending.length) {
        mark('newLeads', 'running')
        for (const row of pending) {
          try {
            await dealLeadsApi.create(buildNewLeadPayload(row, state.source, done.dealId))
            done.newLeadKeys = [...done.newLeadKeys, row.key]
            persist()
            setProgress((current) => ({ ...current, newLeadsSent: done.newLeadKeys.length }))
          } catch (leadError) {
            failed.push({ key: row.key, name: row.name, phone: row.phone, message: extractMessage(leadError, t('dealWorkspace.wizard.review.failed')) })
          }
        }
      }
      if (failed.length) {
        mark('newLeads', 'error')
        setError({ phase, failed, message: t('dealWorkspace.wizard.review.leadsFailed', { count: failed.length }) })
        await client.invalidateQueries({ queryKey: dealKeys.all })
        return
      }
      mark('newLeads', 'done')

      await client.invalidateQueries({ queryKey: dealKeys.all })
      setDraft(null)
      navigate(`/deals/${done.dealId}`)
    } catch (requestError) {
      mark(phase, 'error')
      setError({ phase, message: extractMessage(requestError, t('dealWorkspace.wizard.review.failed')) })
    } finally {
      setSubmitting(false)
    }
  }, [client, created, goTo, navigate, setDraft, state, t])

  /** After some new leads failed: open the deal anyway (they can be added from its leads page). */
  const finishWithoutFailed = useCallback(async () => {
    if (!created.dealId) return
    await client.invalidateQueries({ queryKey: dealKeys.all })
    const dealId = created.dealId
    setDraft(null)
    navigate(`/deals/${dealId}`)
  }, [client, created.dealId, navigate, setDraft])

  return { state, created, step, goTo, update, reset, submit, finishWithoutFailed, submitting, progress, error, hasDraft: Boolean(draft) }
}
