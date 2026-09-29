import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { getServiceErrorMessage, getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useSavedViewMutations } from '../api/savedViewsApi'

/** Names the current filters and saves them as a private or shared view. */
export function SaveViewDialog({ open, onClose, entity, filters, onSaved }) {
  const { t } = useTranslation()
  const { create } = useSavedViewMutations(entity)
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState('private')
  const errors = getServiceFieldErrors(create.error)

  useEffect(() => {
    if (open) {
      setName('')
      setVisibility('private')
      create.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () =>
    create.mutate(
      { name: name.trim(), visibility, filters },
      {
        onSuccess: (view) => {
          toast.success(t('service.savedViews.saved'))
          onSaved?.(view)
          onClose()
        },
        onError: (error) => error?.response?.status !== 422 && toast.error(getServiceErrorMessage(error, t)),
      }
    )

  return (
    <FormDialog open={open} onClose={onClose} title={t('service.savedViews.saveTitle')} submitText={t('service.savedViews.save')} loading={create.isPending} onSubmit={submit}>
      <Input label={t('service.savedViews.name')} value={name} autoFocus error={errors.name ? t('service.settings.validation.required') : undefined} onChange={(event) => setName(event.target.value)} />
      <Select
        label={t('service.savedViews.visibility')}
        value={visibility}
        onChange={(next) => setVisibility(next || 'private')}
        options={['private', 'shared'].map((value) => ({ value, label: t(`service.savedViews.visibilities.${value}`) }))}
      />
    </FormDialog>
  )
}
