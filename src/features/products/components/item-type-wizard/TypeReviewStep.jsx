import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit3 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { buildTypeRelations, buildTypeUnits } from '../../utils/catalogForms'
import { ActiveBadge, CapabilityChips, FormError, KindBadge, useOptionLabel } from '../common/catalogUi'

function Section({ title, step, onEdit, children }) {
  const { t } = useTranslation()
  return (
    <section className="rounded-lg border border-[var(--border)] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
        {step && (
          <Button variant="ghost" size="sm" onClick={() => onEdit(step)}>
            <Edit3 size={14} />
            {t('actions.edit')}
          </Button>
        )}
      </div>
      {children}
    </section>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-1 text-sm">
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className="text-[var(--text)]">{children}</dd>
    </div>
  )
}

/** Last step: everything the type will be saved with; each section links back to its step. */
export function TypeReviewStep({ wizard }) {
  const { t } = useTranslation()
  const optionLabel = useOptionLabel()
  const { form, steps, goTo, units, submitError } = wizard
  const catalogQuery = useCatalogProducts()
  const unitName = useMemo(() => new Map(units.map((unit) => [String(unit.id), unit.name])), [units])
  const itemName = useMemo(() => new Map((catalogQuery.data || []).map((item) => [String(item.id), item.name])), [catalogQuery.data])
  const typeUnits = buildTypeUnits(form.units)
  const relations = buildTypeRelations(form.relations)
  const stepOf = (id) => (steps.includes(id) ? id : null)

  return (
    <div className="space-y-3">
      <FormError message={submitError} />

      <Section title={t('catalogSetup.typeWizard.steps.basics.title')} step={stepOf('basics')} onEdit={goTo}>
        <dl className="divide-y divide-[var(--border)]">
          <Row label={t('catalog.itemTypes.fields.kind')}><KindBadge kind={form.kind} /></Row>
          <Row label={t('catalog.itemTypes.fields.name')}>{form.name}</Row>
          <Row label={t('catalog.itemTypes.fields.code')}><span className="font-mono" dir="ltr">{form.code}</span></Row>
          <Row label={t('catalog.itemTypes.fields.serviceModel')}>{form.service_model ? `${form.service_model} — ${t(`catalog.options.serviceModels.${form.service_model}`)}` : '—'}</Row>
          <Row label={t('catalog.itemTypes.fields.fulfillmentCreates')}>{optionLabel('creates', form.fulfillment_creates) || '—'}</Row>
          <Row label={t('catalog.columns.status')}><ActiveBadge active={form.status} /></Row>
        </dl>
      </Section>

      <Section title={t('catalogSetup.typeWizard.steps.capabilities.title')} step={stepOf('capabilities')} onEdit={goTo}>
        <CapabilityChips capabilities={form.capabilities} emptyText={t('catalog.itemTypes.noCapabilities')} />
      </Section>

      {stepOf('units') && (
        <Section title={t('catalogSetup.typeWizard.steps.units.title')} step="units" onEdit={goTo}>
          {typeUnits.length ? (
            <ul className="space-y-1 text-sm text-[var(--text)]">
              {typeUnits.map((unit) => (
                <li key={unit.unit_id}>
                  {t('catalogSetup.typeWizard.units.example', { unit: unitName.get(String(unit.unit_id)) || unit.unit_id, factor: unit.factor })}
                  {unit.is_default && <span className="ms-2 text-xs text-[var(--brand-accent)]">({t('catalogSetup.typeWizard.units.default')})</span>}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-[var(--text-muted)]">{t('catalogSetup.typeWizard.units.empty')}</p>}
        </Section>
      )}

      <Section title={t('catalogSetup.typeWizard.steps.relations.title')} step={stepOf('relations')} onEdit={goTo}>
        {relations.length ? (
          <ul className="space-y-1 text-sm text-[var(--text)]">
            {relations.map((relation) => (
              <li key={relation.child_product_id}>
                {itemName.get(String(relation.child_product_id)) || `#${relation.child_product_id}`}
                <span className="ms-2 text-xs text-[var(--text-muted)]">
                  {optionLabel('inclusion', relation.inclusion)} · ×{relation.quantity}
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-[var(--text-muted)]">{t('catalog.create.relationsEmpty')}</p>}
      </Section>

      <p className="text-xs text-[var(--text-muted)]">{t('catalogSetup.typeWizard.review.note')}</p>
    </div>
  )
}
