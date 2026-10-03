import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { DEAL_TYPES } from '../../constants/dealOptions'
import { usePipelineTemplateMutations } from '../../hooks/useDeals'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'
import { NEW_STAGE, StagesEditor, buildTemplatePayload } from './StagesEditor'

const DEFAULT_STAGES = [
  { ...NEW_STAGE, name: '', color: '#3B82F6' },
  { ...NEW_STAGE, name: '', color: '#10B981', is_won_stage: true },
  { ...NEW_STAGE, name: '', color: '#EF4444', is_lost_stage: true },
]

/**
 * Create / edit a pipeline template ("update + sync" in Postman). Editing a template does NOT change deals
 * already created from it — their stages were copied (see docs/deals §3).
 */
export function PipelineTemplateDialog({ template, open, onClose }) {
  const { t } = useTranslation()
  const { create, update } = usePipelineTemplateMutations()
  const [name, setName] = useState('')
  const [type, setType] = useState('sales')
  const [stages, setStages] = useState(DEFAULT_STAGES)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(template?.name || '')
    setType(template?.type || 'sales')
    setStages(template?.stages?.length
      ? [...template.stages].sort((a, b) => Number(a.order) - Number(b.order)).map((stage) => ({ ...stage }))
      : DEFAULT_STAGES.map((stage, index) => ({ ...stage, name: t(`dealWorkspace.pipelines.defaultStages.${index}`) })))
    setError('')
  }, [open, t, template])

  const submit = async () => {
    const payload = buildTemplatePayload({ name, type, status: true, stages })
    if (!payload.name) return setError(t('dealWorkspace.pipelines.nameRequired'))
    if (!payload.stages.length) return setError(t('dealWorkspace.pipelines.stagesRequired'))
    try {
      if (template?.id) await update.mutateAsync({ id: template.id, payload })
      else await create.mutateAsync(payload)
      toast.success(t(template?.id ? 'dealWorkspace.pipelines.updated' : 'dealWorkspace.pipelines.created'))
      onClose()
    } catch (requestError) {
      setError(extractMessage(requestError, t('dealWorkspace.pipelines.saveFailed')))
    }
    return null
  }

  return (
    <FormDialog open={open} onClose={onClose} onSubmit={submit} size="lg" loading={create.isPending || update.isPending} title={t(template?.id ? 'dealWorkspace.pipelines.editTitle' : 'dealWorkspace.pipelines.newTitle')} description={t('dealWorkspace.pipelines.dialogHint')}>
      <div className="space-y-4">
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel label={t('dealWorkspace.pipelines.name')}><input className={dealInputClass} value={name} onChange={(event) => setName(event.target.value)} /></FieldLabel>
          <FieldLabel label={t('dealWorkspace.fields.type')}>
            <select className={dealInputClass} value={type} onChange={(event) => setType(event.target.value)}>
              {DEAL_TYPES.map((value) => <option key={value} value={value}>{t(`dealWorkspace.options.dealType.${value}`)}</option>)}
            </select>
          </FieldLabel>
        </div>
        <StagesEditor stages={stages} onChange={setStages} />
      </div>
    </FormDialog>
  )
}
