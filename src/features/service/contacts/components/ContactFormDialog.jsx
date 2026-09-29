import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceErrorMessage, getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useContactsSetup, useCreateContact } from '../api/contactsApi'

const EMPTY = { name: '', phone: '', email: '', role_key: '', from_contact_id: '', relation_type: '' }

/** Add a person under a customer, optionally related to an existing contact. */
export function ContactFormDialog({ open, onClose, customerId, contacts = [] }) {
  const { t, i18n } = useTranslation()
  const setup = useContactsSetup()
  const create = useCreateContact(customerId)
  const [form, setForm] = useState(EMPTY)
  const fieldErrors = getServiceFieldErrors(create.error)
  const language = i18n.language

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      create.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))
  const roleOptions = (setup.data?.roles || []).map((role) => ({ value: role.key, label: localizeLabel(role.label, language, role.key) }))
  const relationOptions = (setup.data?.relation_types || []).map((type) => ({ value: type.key, label: localizeLabel(type.label, language, type.key) }))
  const contactOptions = contacts.map((contact) => ({ value: contact.id, label: contact.name }))
  const required = t('service.cases.validation.required')

  const submit = () => {
    const payload = { name: form.name, phone: form.phone, email: form.email, role_key: form.role_key }
    if (form.from_contact_id && form.relation_type) {
      payload.relation = { from_contact_id: form.from_contact_id, relation_type: form.relation_type }
    }
    create.mutate(payload, {
      onSuccess: () => {
        toast.success(t('service.contacts.created'))
        onClose()
      },
      onError: (error) => {
        if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
      },
    })
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={t('service.contacts.add')}
      description={t('service.contacts.addDescription')}
      submitText={t('service.contacts.save')}
      loading={create.isPending}
      submitDisabled={!form.name.trim() || !form.role_key}
      onSubmit={submit}
    >
      <Input label={t('service.contacts.fields.name')} value={form.name} onChange={(event) => update('name')(event.target.value)} error={fieldErrors.name && required} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label={t('service.contacts.fields.phone')} value={form.phone} dir="ltr" inputMode="tel" onChange={(event) => update('phone')(event.target.value)} />
        <Input label={t('service.contacts.fields.email')} value={form.email} dir="ltr" type="email" onChange={(event) => update('email')(event.target.value)} />
      </div>
      <Select label={t('service.contacts.fields.role')} options={roleOptions} value={form.role_key} onChange={update('role_key')} error={fieldErrors.role_key && required} />
      {contactOptions.length > 0 && (
        <fieldset className="grid gap-3 rounded-lg border border-[var(--border)] p-3">
          <legend className="px-1 text-xs text-[var(--text-muted)]">{t('service.contacts.relationHint')}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label={t('service.contacts.fields.relatedContact')} options={contactOptions} value={form.from_contact_id} onChange={update('from_contact_id')} />
            <Select label={t('service.contacts.fields.relationType')} options={relationOptions} value={form.relation_type} onChange={update('relation_type')} />
          </div>
        </fieldset>
      )}
    </FormDialog>
  )
}
