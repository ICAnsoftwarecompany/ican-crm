import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useDealMutations, usePipelineTemplates } from '../../hooks/useDeals'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { useDealPeople } from '../common/useDealPeople'
import { DealFormFields, buildDealPayload, dealToForm } from './DealFormFields'

/** Edit the deal (`POST /deals/{id}`). The pipeline is locked: stages were copied when the deal was created. */
export function DealGeneralSettings() {
  const { t } = useTranslation()
  const { dealId, deal } = useDealWorkspace()
  const { templates } = usePipelineTemplates()
  const { allUsers } = useDealPeople(dealId)
  const { update } = useDealMutations()
  const [form, setForm] = useState(() => dealToForm(deal))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(dealToForm(deal))
  }, [deal])

  const save = async (event) => {
    event.preventDefault()
    const { payload, errors: nextErrors } = buildDealPayload(form, { requireTemplate: false })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    delete payload.pipeline_template_id
    try {
      await update.mutateAsync({ id: dealId, payload })
      toast.success(t('dealWorkspace.settings.saved'))
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.settings.saveFailed')))
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <DealFormFields form={form} setForm={setForm} errors={errors} templates={templates} users={allUsers} lockTemplate />
      <div className="flex justify-end"><Button type="submit" loading={update.isPending} disabled={update.isPending}>{t('dealWorkspace.settings.save')}</Button></div>
    </form>
  )
}
