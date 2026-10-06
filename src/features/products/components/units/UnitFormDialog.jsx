import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { UNIT_TYPES } from '../../constants/catalogOptions'
import { useUnitMutations } from '../../hooks/useCatalogSetup'
import { getCreatedId } from '../../utils/catalogPayloads'
import { formatApiError } from '../../utils/apiErrors'
import { CheckboxField, FormError, useOptions } from '../common/catalogUi'

const EMPTY = { code: '', name: '', type: 'count', decimals: '0', status: true }

/** Create / edit a unit of measure (`{ code, name, type, decimals, status }`), 2026-10-06. `onSaved(id)` after saving. */
export function UnitFormDialog({ open, unit, onClose, onSaved }) {
  const { t } = useTranslation()
  const isEdit = Boolean(unit)
  const mutations = useUnitMutations()
  const typeOptions = useOptions('unitTypes', UNIT_TYPES)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(unit ? { code: unit.code, name: unit.name, type: unit.type || 'count', decimals: String(unit.decimals ?? 0), status: unit.status } : EMPTY)
  }, [open, unit])

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async () => {
    if (!form.name.trim()) return setError(t('catalog.validation.nameRequired'))
    if (!isEdit && !/^[a-z0-9_]+$/.test(form.code.trim())) return setError(t('catalog.validation.codeFormat'))
    const decimals = Number(form.decimals)
    const body = {
      name: form.name.trim(),
      type: form.type || 'count',
      decimals: Number.isInteger(decimals) && decimals >= 0 ? decimals : 0,
      status: Boolean(form.status),
    }
    try {
      if (isEdit) {
        await mutations.update.mutateAsync({ id: unit.id, payload: body })
        onSaved?.(unit.id)
      } else {
        const response = await mutations.create.mutateAsync({ ...body, code: form.code.trim() })
        onSaved?.(getCreatedId(response))
      }
      toast.success(t(isEdit ? 'catalog.units.updated' : 'catalog.units.created'))
      onClose()
    } catch (requestError) {
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      loading={mutations.create.isPending || mutations.update.isPending}
      title={t(isEdit ? 'catalog.units.editTitle' : 'catalog.units.addTitle')}
    >
      <div className="space-y-4">
        <FormError message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('catalog.units.fields.name')} value={form.name} onChange={(event) => set('name', event.target.value)} autoFocus />
          <Input
            label={t('catalog.units.fields.code')}
            value={form.code}
            dir="ltr"
            placeholder="pack"
            disabled={isEdit}
            hint={t('catalog.itemTypes.codeHint')}
            onChange={(event) => set('code', event.target.value.toLowerCase())}
          />
          <Select label={t('catalog.units.fields.type')} value={form.type} options={typeOptions} onChange={(value) => set('type', value)} />
          <Input
            label={t('catalog.units.fields.decimals')}
            type="number"
            min={0}
            max={6}
            dir="ltr"
            value={form.decimals}
            hint={t('catalog.units.decimalsHint')}
            onChange={(event) => set('decimals', event.target.value)}
          />
        </div>
        <CheckboxField label={t('catalog.common.active')} checked={form.status} onChange={(value) => set('status', value)} />
      </div>
    </FormDialog>
  )
}
