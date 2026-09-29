import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceErrorMessage, getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useCaseSetup } from '../../cases/hooks/useCases'
import { useResourceList } from '../../settings/api/settingsApi'
import { CheckboxGroupField, SwitchField } from '../../settings/components/fields/ResourceField'
import { itemTypesResource, recordTypesResource } from '../../settings/resources/catalogResources'
import { useCatalogItems, useUpdateServiceConfig } from '../api/catalogApi'

const CREATES = ['none', 'order', 'asset', 'subscription', 'enrollment', 'booking', 'shipment', 'project', 'work_order']
const RECORD_BACKED = new Set(['booking', 'enrollment', 'shipment', 'project'])
const EMPTY = { item_type_id: null, capability_overrides: [], fulfillment: { creates: 'none', record_type_id: null, default_queue_id: null, allowed_case_type_ids: [], portal_visible: true }, relations: [] }

/** Edit one catalog item's service configuration (spec §25.8–25.10). */
export function CatalogItemDrawer({ item, onClose }) {
  const { t, i18n } = useTranslation()
  const itemTypes = useResourceList(itemTypesResource)
  const recordTypes = useResourceList(recordTypesResource)
  const allItems = useCatalogItems({})
  const setup = useCaseSetup()
  const save = useUpdateServiceConfig()
  const [config, setConfig] = useState(EMPTY)
  const errors = getServiceFieldErrors(save.error)
  const label = (entry, field = 'label') => localizeLabel(entry?.[field], i18n.language, entry?.key || entry?.id)

  useEffect(() => {
    if (item) {
      setConfig({ ...EMPTY, ...item.service_config, fulfillment: { ...EMPTY.fulfillment, ...item.service_config?.fulfillment } })
      save.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  const setFulfillment = (patch) => setConfig((current) => ({ ...current, fulfillment: { ...current.fulfillment, ...patch } }))
  const setRelation = (index, patch) => setConfig((current) => ({ ...current, relations: current.relations.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)) }))
  const pickType = (typeId) => {
    const type = (itemTypes.data || []).find((entry) => entry.id === typeId)
    setConfig((current) => ({
      ...current,
      item_type_id: typeId || null,
      fulfillment: { ...current.fulfillment, record_type_id: current.fulfillment.record_type_id || type?.record_type_id || null },
    }))
  }
  const submit = () =>
    save.mutate(
      { itemId: item.id, serviceConfig: config },
      {
        onSuccess: () => {
          toast.success(t('service.settings.toasts.updated'))
          onClose()
        },
        onError: (error) => error?.response?.status !== 422 && toast.error(getServiceErrorMessage(error, t)),
      }
    )
  const fieldError = (name) => (errors[name] ? t(`service.settings.validation.${errors[name][0]}`, { defaultValue: t('service.settings.validation.required') }) : undefined)
  const children = (allItems.data || []).filter((entry) => entry.id !== item?.id)

  return (
    <AppDrawer open={Boolean(item)} onClose={onClose} title={item ? label(item, 'name') : ''} description={t('service.catalog.drawerDescription')} size="lg" pushPage={false}>
      {item && (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <Select label={t('service.catalog.itemType')} placeholder={t('service.catalog.noType')} value={config.item_type_id || ''} onChange={pickType} error={fieldError('item_type_id')} options={(itemTypes.data || []).map((type) => ({ value: type.id, label: label(type, 'name') }))} />

          <section className="grid gap-3 rounded-lg border border-[var(--border)] p-3">
            <h3 className="text-sm font-semibold text-[var(--text)]">{t('service.catalog.fulfillment')}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label={t('service.catalog.createsField')} value={config.fulfillment.creates} onChange={(next) => setFulfillment({ creates: next || 'none' })} error={fieldError('fulfillment.creates')} options={CREATES.map((value) => ({ value, label: t(`service.catalog.creates.${value}`) }))} />
              {RECORD_BACKED.has(config.fulfillment.creates) && (
                <Select label={t('service.catalog.recordType')} value={config.fulfillment.record_type_id || ''} onChange={(next) => setFulfillment({ record_type_id: next || null })} error={fieldError('fulfillment.record_type_id')} options={(recordTypes.data || []).map((type) => ({ value: type.id, label: label(type) }))} />
              )}
              <Select label={t('service.catalog.defaultQueue')} placeholder={t('service.catalog.noQueue')} value={config.fulfillment.default_queue_id || ''} onChange={(next) => setFulfillment({ default_queue_id: next || null })} options={(setup.data?.queues || []).map((queue) => ({ value: queue.id, label: label(queue) }))} />
            </div>
            <CheckboxGroupField label={t('service.catalog.allowedCaseTypes')} hint={t('service.settings.fields.emptyMeansAll')} value={config.fulfillment.allowed_case_type_ids} onChange={(next) => setFulfillment({ allowed_case_type_ids: next })} options={(setup.data?.case_types || []).map((type) => ({ value: type.id, label: label(type) }))} />
            <SwitchField label={t('service.catalog.portalVisible')} value={config.fulfillment.portal_visible} onChange={(next) => setFulfillment({ portal_visible: next })} />
          </section>

          <section className="grid gap-2 rounded-lg border border-[var(--border)] p-3">
            <h3 className="text-sm font-semibold text-[var(--text)]">{t('service.catalog.relations')}</h3>
            <p className="text-xs text-[var(--text-muted)]">{t('service.catalog.relationsHint')}</p>
            {config.relations.map((relation, index) => (
              <div key={index} className="grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_5rem_auto]">
                <Select aria-label={t('service.catalog.relatedItem')} value={relation.child_item_id} onChange={(next) => setRelation(index, { child_item_id: next })} options={children.map((entry) => ({ value: entry.id, label: label(entry, 'name') }))} />
                <Select aria-label={t('service.catalog.inclusion')} value={relation.inclusion} onChange={(next) => setRelation(index, { inclusion: next || 'included', auto_add: next !== 'optional' })} options={['included', 'optional'].map((value) => ({ value, label: t(`service.catalog.inclusions.${value}`) }))} />
                <Input type="number" min="1" dir="ltr" aria-label={t('service.catalog.quantity')} value={relation.quantity} onChange={(event) => setRelation(index, { quantity: Number(event.target.value) || 1 })} />
                <Button type="button" variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={() => setConfig((current) => ({ ...current, relations: current.relations.filter((_, rowIndex) => rowIndex !== index) }))}>
                  <Trash2 size={16} aria-hidden="true" />
                </Button>
              </div>
            ))}
            {fieldError('relations') && <p className="text-xs text-status-lost">{fieldError('relations')}</p>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              disabled={!children.length}
              onClick={() => setConfig((current) => ({ ...current, relations: [...current.relations, { child_item_id: children[0]?.id, inclusion: 'included', quantity: 1, price_override: null, auto_add: true }] }))}
            >
              <Plus size={14} aria-hidden="true" />
              {t('service.catalog.addRelation')}
            </Button>
          </section>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>{t('actions.cancel')}</Button>
            <Button type="submit" loading={save.isPending}>{t('service.settings.actions.save')}</Button>
          </div>
        </form>
      )}
    </AppDrawer>
  )
}
