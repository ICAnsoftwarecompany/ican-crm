import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { requiresSerials } from '../../utils/productCreateWizard'
import { FormError, KindBadge, useCapabilityName, useNumberFormat, useOptionLabel } from '../common/catalogUi'

const STATUS_ICONS = { done: CheckCircle2, running: Loader2, failed: XCircle }

function RequestLine({ status, children }) {
  const Icon = STATUS_ICONS[status] || Circle
  const tone = status === 'done' ? 'text-emerald-600 dark:text-emerald-400' : status === 'failed' ? 'text-[#EF4444]' : 'text-[var(--text-muted)]'
  return (
    <li className="flex items-start gap-2 text-sm text-[var(--text)]">
      <Icon size={16} className={`mt-0.5 shrink-0 ${tone} ${status === 'running' ? 'animate-spin' : ''}`} aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </li>
  )
}

function Section({ title, onEdit, children }) {
  const { t } = useTranslation()
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
        {onEdit && <Button variant="ghost" size="sm" onClick={onEdit}>{t('actions.edit')}</Button>}
      </div>
      <div className="space-y-1 text-sm text-[var(--text-muted)]">{children}</div>
    </section>
  )
}

/** Summary of every step and the list of requests the save sends, with their progress. */
export function ReviewStep({ wizard, onEdit }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  const optionLabel = useOptionLabel()
  const capabilityName = useCapabilityName()
  const catalogQuery = useCatalogProducts()
  const { formState, itemType, plan, progress, done, error, locked } = wizard
  const { form } = formState
  const names = useMemo(() => new Map((catalogQuery.data || []).map((item) => [String(item.id), item.name])), [catalogQuery.data])
  const unitNames = new Map(formState.units.map((unit) => [String(unit.id), unit.name]))
  const edit = locked ? undefined : onEdit
  const missingSerials = requiresSerials(itemType) && !plan.instances.instances.length

  return (
    <div className="space-y-3">
      <FormError message={error} />
      {locked && <ModuleNotice>{t('catalog.create.createdNote', { id: done.productId })}</ModuleNotice>}

      <div className="grid gap-3 lg:grid-cols-2">
        <Section title={t('catalog.create.steps.basics.title')} onEdit={edit && (() => edit('basics'))}>
          <p className="flex flex-wrap items-center gap-2"><span className="font-semibold text-[var(--text)]">{plan.product.name}</span><KindBadge kind={form.kind} /></p>
          <p>{t('catalog.product.fields.price')}: <span dir="ltr">{formatNumber(plan.product.price)}</span></p>
          <p>{t('catalog.product.fields.itemType')}: {itemType?.name || t('catalog.product.noItemType')}</p>
          {form.image && <p>{t('catalog.product.fields.image')}: {form.image.name}</p>}
        </Section>

        <Section title={t('catalog.create.steps.stock.title')} onEdit={edit && (() => edit('stock'))}>
          <p>{plan.product.is_stock_tracked ? `${t('catalog.product.fields.stockQuantity')}: ${formatNumber(plan.product.stock_quantity)}` : t('catalog.product.notTracked')}</p>
          {(plan.product.units || []).map((unit) => (
            <p key={`${unit.unit_id}-${unit.factor}`}>{unitNames.get(String(unit.unit_id)) || `#${unit.unit_id}`} × <span dir="ltr">{unit.factor}</span></p>
          ))}
        </Section>

        <Section title={t('catalog.create.steps.capabilities.title')} onEdit={edit && (() => edit('capabilities'))}>
          {itemType?.capabilities?.length
            ? <p>{itemType.capabilities.map((capability) => capabilityName(capability.code)).join(' · ')}</p>
            : <p>{t('catalog.itemTypes.noCapabilities')}</p>}
          {plan.product.capability_values && <p>{t('catalog.create.overridesCount', { count: Object.keys(plan.product.capability_values).length })}</p>}
          {plan.product.fulfillment_config && <p>{t('catalog.product.fields.fulfillmentCreates')}: {optionLabel('creates', plan.product.fulfillment_config.creates)}</p>}
        </Section>

        <Section title={t('catalog.create.steps.relations.title')} onEdit={edit && (() => edit('relations'))}>
          {plan.relations.length
            ? plan.relations.map(({ key, body }) => <p key={key}>{names.get(String(body.child_product_id)) || `#${body.child_product_id}`} — {optionLabel('inclusion', body.inclusion)}</p>)
            : <p>{t('catalog.create.relationsEmpty')}</p>}
        </Section>
      </div>

      {missingSerials && <ModuleNotice tone="warning">{t('catalog.create.serialsMissing')}</ModuleNotice>}

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <h3 className="mb-2 text-sm font-semibold text-[var(--text)]">{t('catalog.create.requestsTitle')}</h3>
        <ol className="space-y-1.5">
          <RequestLine status={done.productId ? 'done' : progress.product}>{t('catalog.create.requests.product')}</RequestLine>
          {plan.relations.map(({ key, body }) => (
            <RequestLine key={key} status={done.relations.includes(key) ? 'done' : progress[`relation:${key}`]}>
              {t('catalog.create.requests.relation', { name: names.get(String(body.child_product_id)) || `#${body.child_product_id}` })}
            </RequestLine>
          ))}
          {plan.instances.instances.length > 0 && (
            <RequestLine status={done.instances ? 'done' : progress.instances}>
              {t('catalog.create.requests.instances', { count: plan.instances.instances.length })}
            </RequestLine>
          )}
        </ol>
      </section>
    </div>
  )
}
