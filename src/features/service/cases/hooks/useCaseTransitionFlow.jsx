import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CaseTransitionDialog } from '../components/CaseTransitionDialog'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'
import { useCaseMutations } from './useCases'

/**
 * One flow for every status change (menu, board drop, shortcuts):
 * transitions without required fields run immediately; others open the
 * dialog. Render `transitionDialog` once in the screen.
 */
export function useCaseTransitionFlow(setup) {
  const { t } = useTranslation()
  const { transition } = useCaseMutations()
  const [pending, setPending] = useState(null)

  const run = (caseItem, target, extra = {}) =>
    transition.mutate(
      { caseId: caseItem.id, to_status_id: target.status.id, version: caseItem.version, ...extra },
      {
        onSuccess: () => {
          setPending(null)
          toast.success(t('service.cases.transition.done'))
        },
        onError: (error) => {
          if (error?.response?.status !== 422) {
            setPending(null)
            toast.error(getServiceErrorMessage(error, t))
          }
        },
      }
    )

  const requestTransition = (caseItem, target) => {
    if (!caseItem || !target) return
    if (target.requiredFields?.length) {
      transition.reset()
      setPending({ caseItem, target })
      return
    }
    run(caseItem, target)
  }

  const transitionDialog = (
    <CaseTransitionDialog
      open={Boolean(pending)}
      target={pending?.target}
      setup={setup}
      loading={transition.isPending}
      error={transition.error}
      onClose={() => setPending(null)}
      onSubmit={(values) => run(pending.caseItem, pending.target, values)}
    />
  )

  return { requestTransition, transitionDialog, isTransitioning: transition.isPending }
}
