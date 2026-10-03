import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useUsers } from '../../../users'
import { useDealMutations, usePipelineTemplates } from '../../hooks/useDeals'
import { DealFormFields, EMPTY_DEAL_FORM, buildDealPayload } from '../settings/DealFormFields'

/** New deal (`POST /deals`) → opens its workspace. */
export function CreateDealDialog({ open, onClose }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { templates } = usePipelineTemplates()
  const usersQuery = useUsers()
  const { create } = useDealMutations()
  const [form, setForm] = useState(EMPTY_DEAL_FORM)
  const [errors, setErrors] = useState({})
  const users = (usersQuery.data || []).map((user) => ({ id: String(user.id), name: user.name || user.email || '' }))

  useEffect(() => {
    if (open) {
      setForm(EMPTY_DEAL_FORM)
      setErrors({})
    }
  }, [open])

  const submit = async () => {
    const { payload, errors: nextErrors } = buildDealPayload(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      const response = await create.mutateAsync(payload)
      const id = response?.data?.id ?? response?.data?.deal?.id ?? response?.id
      toast.success(t('dealWorkspace.form.created'))
      onClose()
      if (id) navigate(`/deals/${id}`)
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.form.createFailed')))
    }
  }

  return (
    <FormDialog open={open} onClose={onClose} onSubmit={submit} size="lg" loading={create.isPending} title={t('dealWorkspace.form.title')} description={t('dealWorkspace.form.description')} submitText={t('dealWorkspace.form.save')}>
      <DealFormFields form={form} setForm={setForm} errors={errors} templates={templates} users={users} />
    </FormDialog>
  )
}
