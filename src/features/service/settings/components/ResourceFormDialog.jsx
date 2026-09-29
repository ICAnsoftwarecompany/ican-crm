import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { getServiceErrorMessage, getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useResourceMutations } from '../api/settingsApi'
import { ResourceField } from './fields/ResourceField'

/**
 * Create / edit dialog for any settings resource. Fields come from the
 * resource definition; layout groups fields with `row: 'name'` side by side.
 */
export function ResourceFormDialog({ resource, open, item, ctx, onClose }) {
  const { t } = useTranslation()
  const { create, update } = useResourceMutations(resource)
  const mutation = item ? update : create
  const [values, setValues] = useState(() => item || resource.emptyValue())
  const fieldErrors = getServiceFieldErrors(mutation.error)

  useEffect(() => {
    if (open) {
      setValues(item ? { ...resource.emptyValue(), ...(resource.fromItem ? resource.fromItem(item) : item) } : resource.emptyValue())
      create.reset()
      update.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item])

  const submit = () => {
    const payload = resource.toPayload ? resource.toPayload(values) : values
    mutation.mutate(item ? { id: item.id, ...payload } : payload, {
      onSuccess: () => {
        toast.success(t(item ? 'service.settings.toasts.updated' : 'service.settings.toasts.created'))
        onClose()
      },
      onError: (error) => {
        // 422 errors on fields the form shows are rendered inline; anything else (e.g. macro `actions`) is toasted.
        const shown = new Set(resource.fields.map((field) => field.name))
        const hidden = Object.keys(getServiceFieldErrors(error)).some((name) => !shown.has(name))
        if (error?.response?.status !== 422 || hidden) toast.error(getServiceErrorMessage(error, t))
      },
    })
  }

  const fieldError = (name) => {
    const code = fieldErrors[name]?.[0]
    return code ? t(`service.settings.validation.${code}`, { defaultValue: t('service.settings.validation.required') }) : undefined
  }

  const rows = []
  resource.fields.forEach((field) => {
    const last = rows[rows.length - 1]
    if (field.row && last?.row === field.row) last.fields.push(field)
    else rows.push({ row: field.row, fields: [field] })
  })

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      size="lg"
      title={t(item ? 'service.settings.edit' : 'service.settings.create', { resource: t(`${resource.i18nKey}.one`) })}
      description={t(`${resource.i18nKey}.description`)}
      submitText={t('service.settings.actions.save')}
      loading={mutation.isPending}
      onSubmit={submit}
    >
      {rows.map((row, index) => (
        <div key={row.row || index} className={row.fields.length > 1 ? 'grid gap-3 sm:grid-cols-2' : undefined}>
          {row.fields.map((field) => (
            <ResourceField
              key={field.name}
              field={field}
              ctx={ctx}
              value={values[field.name]}
              error={fieldError(field.name)}
              onChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))}
            />
          ))}
        </div>
      ))}
    </FormDialog>
  )
}
