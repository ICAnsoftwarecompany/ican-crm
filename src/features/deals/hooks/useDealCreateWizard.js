import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from '../../../shared/components/data-table/hooks/useLocalStorage'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { dealResourcesApi, dealsApi, pipelineTemplatesApi } from '../api'
import { dealKeys } from '../constants/dealQueryKeys'
import { WIZARD_STEPS, buildWizardRequests, createWizardState, extractCreatedId, firstInvalidStepBefore } from '../utils/dealWizard'

const DRAFT_KEY = 'deals:create-wizard:draft'
const EMPTY_CREATED = { templateId: null, dealId: null, teamDone: [], productsDone: false }

/**
 * State + submission of the "new deal" wizard. The draft (answers + what was already created) lives in
 * localStorage, so a reload or a failed request never loses the answers and never creates a second deal:
 * a retry continues from the request that failed.
 */
export function useDealCreateWizard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const client = useQueryClient()
  const stageNames = useMemo(() => [0, 1, 2, 3].map((index) => t(`dealWorkspace.wizard.pipeline.defaultStages.${index}`)), [t])
  const [draft, setDraft] = useLocalStorage(DRAFT_KEY, null)
  const state = draft?.state || createWizardState(stageNames)
  const created = draft?.created || EMPTY_CREATED
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

      const team = requests.team(done.dealId)
      for (let index = 0; index < team.length; index += 1) {
        phase = `team-${index}`
        if (done.teamDone.includes(index)) {
          mark(phase, 'done')
          continue
        }
        mark(phase, 'running')
        await dealResourcesApi.addTeamMember(team[index])
        done.teamDone = [...done.teamDone, index]
        persist()
        mark(phase, 'done')
      }

      phase = 'products'
      const products = requests.products(done.dealId)
      if (products && !done.productsDone) {
        mark('products', 'running')
        await dealResourcesApi.addProducts(products)
        done.productsDone = true
        persist()
      }
      mark('products', 'done')

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

  return { state, created, step, goTo, update, reset, submit, submitting, progress, error, hasDraft: Boolean(draft) }
}
