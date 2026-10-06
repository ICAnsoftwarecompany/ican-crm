import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Check, PackagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { ModulePageHeader } from '../../../../shared/components/module-pages'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { CREATE_STEPS } from '../../utils/productCreateWizard'
import { AdditionalDataFields, getAdditionalFieldNames } from '../common/AdditionalDataFields'
import { ItemTypeFormDrawer } from '../item-types/ItemTypeFormDrawer'
import { ProductBasicFields } from '../products/ProductBasicFields'
import { ProductCapabilityFields } from '../products/ProductCapabilityFields'
import { ProductStockFields } from '../products/ProductStockFields'
import { UnitFormDialog } from '../units/UnitFormDialog'
import { InstancesStep } from './InstancesStep'
import { RelationsStep } from './RelationsStep'
import { ReviewStep } from './ReviewStep'
import { useProductCreateWizard } from './useProductCreateWizard'

function Stepper({ step, done, onSelect }) {
  const { t } = useTranslation()
  const current = CREATE_STEPS.indexOf(step)
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1" aria-label={t('catalog.create.stepsLabel')}>
      {CREATE_STEPS.map((id, index) => (
        <li key={id} className="min-w-[140px] flex-1">
          <button
            type="button"
            onClick={() => onSelect(id)}
            aria-current={id === step ? 'step' : undefined}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-start transition-colors',
              id === step ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
            )}
          >
            <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', index < current || done ? 'bg-[var(--brand-accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text)]')}>
              {index < current || done ? <Check size={14} /> : index + 1}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[var(--text)]">{t(`catalog.create.steps.${id}.title`)}</span>
              <span className="block truncate text-xs text-[var(--text-muted)]">{t(`catalog.create.steps.${id}.hint`)}</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

/**
 * `/products/new` (`?kind=service` for a service) — 2026-10-07. Follows the create flow of the collection:
 * basic data & item type → stock & units → capabilities → attached items → instances → review & save.
 * Item types and units can be created without leaving the wizard.
 */
export function ProductCreateWizard({ kind = 'product' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const wizard = useProductCreateWizard({ kind, t })
  const { step, goTo, formState, locked } = wizard
  const [newItemType, setNewItemType] = useState(false)
  const [newUnit, setNewUnit] = useState(false)
  const index = CREATE_STEPS.indexOf(step)
  const listPath = kind === 'service' ? '/products/services' : '/products'

  const save = async () => {
    const productId = await wizard.submit()
    if (!productId) return
    toast.success(t('catalog.product.created', { entity: t(`catalog.entity.${formState.form.kind}`) }))
    navigate(`/products/${productId}`)
  }

  const back = () => (index === 0 ? navigate(listPath) : goTo(CREATE_STEPS[index - 1]))

  return (
    <div className="space-y-4">
      <ModulePageHeader icon={PackagePlus} title={t(`catalog.create.title.${kind === 'service' ? 'service' : 'product'}`)} description={t('catalog.create.description')} />
      <Stepper step={step} done={locked} onSelect={goTo} />

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <header className="mb-4">
          <h2 className="text-base font-bold text-[var(--text)]">{t(`catalog.create.steps.${step}.title`)}</h2>
          <p className="text-sm text-[var(--text-muted)]">{t(`catalog.create.steps.${step}.description`)}</p>
        </header>
        <fieldset disabled={locked && step !== 'review'} className="min-w-0">
          {step === 'basics' && <ProductBasicFields mode="create" state={formState} onCreateItemType={() => setNewItemType(true)} />}
          {step === 'stock' && <ProductStockFields mode="create" state={formState} onCreateUnit={() => setNewUnit(true)} />}
          {step === 'capabilities' && (
            <div className="space-y-6">
              <ProductCapabilityFields state={formState} />
              <div className="border-t border-[var(--border)] pt-4">
                <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">{t('catalog.product.tabs.additional')}</h3>
                <AdditionalDataFields
                  rows={formState.additionalRows}
                  onChange={formState.setAdditionalRows}
                  suggestions={getAdditionalFieldNames(formState.categories.find((category) => String(category.id) === String(formState.form.category_id))?.data)}
                />
              </div>
            </div>
          )}
          {step === 'relations' && <RelationsStep rows={wizard.relations} errors={wizard.stepErrors} onChange={wizard.setRelations} />}
          {step === 'instances' && (
            <InstancesStep
              itemType={wizard.itemType}
              modes={wizard.instanceModes}
              value={wizard.instances}
              onChange={wizard.setInstances}
              invalid={wizard.plan.instances.invalid}
              count={wizard.plan.instances.instances.length}
            />
          )}
          {step === 'review' && <ReviewStep wizard={wizard} onEdit={goTo} />}
        </fieldset>
        {locked && step !== 'review' && <p className="mt-3 text-xs text-[var(--text-muted)]">{t('catalog.create.lockedNote')}</p>}
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" onClick={back} disabled={wizard.submitting}>
          <ArrowLeft size={15} className="rtl:rotate-180" />
          {index === 0 ? t('actions.cancel') : t('actions.back')}
        </Button>
        {step === 'review' ? (
          <Button onClick={save} loading={wizard.submitting} disabled={wizard.submitting}>
            {wizard.error ? t('catalog.create.retry') : locked ? t('catalog.create.finish') : t('catalog.create.save')}
          </Button>
        ) : (
          <Button onClick={() => goTo(CREATE_STEPS[index + 1])}>{t('actions.next')}<ArrowRight size={15} className="rtl:rotate-180" /></Button>
        )}
      </footer>

      <ItemTypeFormDrawer
        open={newItemType}
        itemType={null}
        initialKind={formState.form.kind}
        onClose={() => setNewItemType(false)}
        onSaved={(id) => {
          if (!id) return
          formState.update('item_type_id', String(id))
          formState.update('capability_values', {})
        }}
      />
      <UnitFormDialog
        open={newUnit}
        unit={null}
        onClose={() => setNewUnit(false)}
        onSaved={(id) => {
          if (!id) return
          formState.update('units', [...(formState.form.units || []), { key: `unit-new-${id}`, unit_id: String(id), factor: '', price: '', barcode: '', is_default: false }])
        }}
      />
    </div>
  )
}
