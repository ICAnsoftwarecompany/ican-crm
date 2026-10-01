import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { FormDialog } from '../../../shared/components/overlays/FormDialog'
import { Input } from '../../../shared/components/ui/Input'
import { extractMessage } from '../../../shared/utils/apiResponse'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  type: 'customer',
  source: 'manual',
}

export function NewCustomerDialog({ isOpen, onClose, onSubmit, isLoading }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(initialForm)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMessage(t('customers.newCustomerDialog.nameAndPhoneRequired'))
      return
    }

    try {
      await onSubmit({ customers: [{ ...form, attributes: {} }] })
      setForm(initialForm)
      setErrorMessage('')
      setTimeout(() => onClose(), 500)
    } catch (error) {
      setErrorMessage(extractMessage(error, t('customers.newCustomerDialog.createFailed')))
    }
  }

  return (
    <FormDialog
      open={isOpen}
      onClose={() => {
        setForm(initialForm)
        setErrorMessage('')
        onClose()
      }}
      title={t('customers.newCustomer')}
      onSubmit={handleSubmit}
      submitText={t('actions.add')}
      loading={isLoading}
      size="md"
    >
      {errorMessage && (
        <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3 font-arabic">
          {errorMessage}
        </div>
      )}

      <Input
        label={t('customers.name')}
        name="name"
        value={form.name}
        onChange={handleChange}
        disabled={isLoading}
      />
      <Input
        label={t('customers.phone')}
        name="phone"
        value={form.phone}
        onChange={handleChange}
        disabled={isLoading}
      />
      <Input
        label={t('customers.email')}
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        disabled={isLoading}
      />
      <Input
        label={t('customers.table.company')}
        name="company"
        value={form.company}
        onChange={handleChange}
        disabled={isLoading}
      />
      <Input
        label={t('customers.newCustomerDialog.source')}
        name="source"
        value={form.source}
        onChange={handleChange}
        disabled={isLoading}
      />

      <label className="grid gap-1.5 text-sm font-medium font-arabic text-[var(--text)]">
        {t('customers.newCustomerDialog.type')}
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          disabled={isLoading}
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--text)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="customer">{t('customers.newCustomerDialog.typeCustomer')}</option>
          <option value="lead">{t('customers.newCustomerDialog.typeLead')}</option>
        </select>
      </label>
    </FormDialog>
  )
}

