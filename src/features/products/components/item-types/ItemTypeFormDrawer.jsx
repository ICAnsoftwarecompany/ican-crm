import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { FULFILLMENT_CREATES, PRODUCT_KINDS, SERVICE_MODELS } from '../../constants/catalogOptions'
import { useItemTypeMutations } from '../../hooks/useCatalogSetup'
import { buildItemTypePayload, itemTypeToForm, validateItemTypeForm } from '../../utils/catalogForms'
import { getCreatedId } from '../../utils/catalogPayloads'
import { formatApiError } from '../../utils/apiErrors'
import { CheckboxField, FormError, TextAreaField, useOptions } from '../common/catalogUi'
import { CapabilitiesEditor } from './CapabilitiesEditor'

/**
 * Create / edit an item type with its capabilities (2026-10-06). The code is fixed after creation.
 * `initialKind` presets the kind of a new type; `onSaved(id)` gets the created / edited id (used by the
 * product wizard to select the new type).
 */
export function ItemTypeFormDrawer({ open, itemType, initialKind, onClose, onSaved }) {
  const { t } = useTranslation()
  const mode = itemType ? 'edit' : 'create'
  const mutations = useItemTypeMutations()
  const kindOptions = useOptions('kinds', PRODUCT_KINDS)
  const createsOptions = useOptions('creates', FULFILLMENT_CREATES)
  const modelOptions = SERVICE_MODELS.map((code) => ({ value: code, label: `${code} — ${t(`catalog.options.serviceModels.${code}`)}` }))
  const [form, setForm] = useState(() => itemTypeToForm(itemType))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(itemType ? itemTypeToForm(itemType) : { ...itemTypeToForm(null), kind: initialKind || 'product' })
    setErrors({})
    setSubmitError('')
  }, [initialKind, itemType, open])

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const saving = mutations.create.isPending || mutations.update.isPending

  const submit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    const nextErrors = validateItemTypeForm(form, { mode })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const payload = buildItemTypePayload(form, { mode })
    try {
      if (mode === 'create') {
        const response = await mutations.create.mutateAsync(payload)
        onSaved?.(getCreatedId(response))
      } else {
        await mutations.update.mutateAsync({ id: itemType.id, payload })
        onSaved?.(itemType.id)
      }
      toast.success(t(mode === 'create' ? 'catalog.itemTypes.created' : 'catalog.itemTypes.updated'))
      onClose()
    } catch (error) {
      setSubmitError(formatApiError(error, t('catalog.common.saveFailed')))
    }
  }

  const fieldError = (key) => (errors[key] ? t(`catalog.validation.${errors[key]}`) : undefined)

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      size="lg"
      title={t(mode === 'create' ? 'catalog.itemTypes.addTitle' : 'catalog.itemTypes.editTitle')}
      description={t('catalog.itemTypes.drawerDescription')}
    >
      <form onSubmit={submit} className="flex min-h-[calc(100vh-7.5rem)] flex-col gap-4">
        <FormError message={submitError} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('catalog.itemTypes.fields.name')} value={form.name} error={fieldError('name')} onChange={(event) => set('name', event.target.value)} autoFocus />
          <Input
            label={t('catalog.itemTypes.fields.code')}
            value={form.code}
            dir="ltr"
            disabled={mode === 'edit'}
            placeholder="appliance"
            error={fieldError('code')}
            hint={t('catalog.itemTypes.codeHint')}
            onChange={(event) => set('code', event.target.value.toLowerCase())}
          />
          <Select label={t('catalog.itemTypes.fields.kind')} value={form.kind} options={kindOptions} onChange={(value) => set('kind', value || 'product')} />
          <Select label={t('catalog.itemTypes.fields.serviceModel')} value={form.service_model} placeholder={t('catalog.common.none')} options={modelOptions} onChange={(value) => set('service_model', value)} />
          <Select label={t('catalog.itemTypes.fields.fulfillmentCreates')} value={form.fulfillment_creates} placeholder={t('catalog.common.none')} options={createsOptions} onChange={(value) => set('fulfillment_creates', value)} />
          <div className="flex items-end pb-2">
            <CheckboxField label={t('catalog.common.active')} checked={form.status} onChange={(value) => set('status', value)} />
          </div>
        </div>
        <TextAreaField label={t('catalog.itemTypes.fields.description')} value={form.description} onChange={(value) => set('description', value)} rows={2} />

        <div className="border-t border-[var(--border)] pt-4">
          <h3 className="mb-1 text-sm font-semibold text-[var(--text)]">{t('catalog.itemTypes.fields.capabilities')}</h3>
          <p className="mb-3 text-xs text-[var(--text-muted)]">{t('catalog.itemTypes.capabilitiesHint')}</p>
          <CapabilitiesEditor kind={form.kind} value={form.capabilities} errors={errors} onChange={(capabilities) => set('capabilities', capabilities)} />
        </div>

        <div className="mt-auto flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>{t('actions.cancel')}</Button>
          <Button type="submit" loading={saving}>{mode === 'create' ? t('catalog.itemTypes.addTitle') : t('catalog.common.saveChanges')}</Button>
        </div>
      </form>
    </AppDrawer>
  )
}
