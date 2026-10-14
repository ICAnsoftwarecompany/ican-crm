import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, BookOpen, Info, PackagePlus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { ModulePageHeader } from '../../../shared/components/module-pages'
import { Button } from '../../../shared/components/ui/Button'
import { cn } from '../../../shared/utils/cn'
import { CheckboxField } from '../components/common/catalogUi'
import { HelpScope } from '../components/common/HelpTip'
import { TutorialPanel } from '../components/common/TutorialPanel'
import { UnitFormDialog } from '../components/units/UnitFormDialog'
import { usePersistentFlag } from '../hooks/usePersistentFlag'
import { CatalogSetupGuide, QuickItemTypeDialog } from '../item-type-wizard'
import { CreateStepper } from './components/CreateStepper'
import { DraftsPanel } from './components/DraftsPanel'
import { QuickCategoryDialog } from './components/QuickCategoryDialog'
import { StepTypeNote } from './components/StepTypeNote'
import { QuickAddMode } from './QuickAddMode'
import { useProductCreateWizard } from './hooks/useProductCreateWizard'
import { BasicsStep } from './steps/BasicsStep'
import { DetailsStep } from './steps/DetailsStep'
import { InstancesStep } from './steps/InstancesStep'
import { RelationsStep } from './steps/RelationsStep'
import { ReviewStep } from './steps/ReviewStep'
import { StockStep } from './steps/StockStep'

/**
 * `/products/new` (`?kind=service`, `?item_type=<id>`, `?draft=<id>`) — 2026-10-07, rebuilt 2026-10-15.
 * Full mode: steps that follow the item type, tutorial panel, quick type / category / unit dialogs, drafts.
 * Quick add mode (checkbox in the header): name + category + price, Enter saves, side list of what was added.
 * Everything is explained in ./README.md.
 */
export function ProductCreateWizard({ kind = 'product', initialItemTypeId = '', draftId = '' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const wizard = useProductCreateWizard({ kind, initialItemTypeId, draftId, t })
  const { steps, step, goTo, formState, locked } = wizard
  const [tutorial, setTutorial] = usePersistentFlag('product-tutorial', true)
  const [quickMode, setQuickMode] = usePersistentFlag(`product-quick-add-${kind === 'service' ? 'service' : 'product'}`, false)
  const [dialog, setDialog] = useState(null) // 'type' | 'category' | 'unit' | null
  const index = steps.indexOf(step)
  const entity = kind === 'service' ? 'service' : 'product'
  const listPath = kind === 'service' ? '/products/services' : '/products'
  const selfPath = (id) => `/products/new?${new URLSearchParams({ ...(kind === 'service' ? { kind: 'service' } : {}), draft: id })}`

  const save = async () => {
    const productId = await wizard.submit()
    if (!productId) return
    toast.success(t('catalog.product.created', { entity: t(`catalog.entity.${formState.form.kind}`) }))
    navigate(`/products/${productId}`)
  }

  const saveDraft = () => {
    wizard.saveDraft()
    toast.success(t('productSetup.drafts.saved'))
  }

  // The full item type page needs to leave this one: the answers become a draft it comes back to (with ?item_type=).
  const openFullTypePage = () => {
    const id = wizard.saveDraft()
    const params = new URLSearchParams({ kind: formState.form.kind || kind, returnTo: selfPath(id) })
    navigate(`/products/item-types/new?${params}`)
  }

  const header = (
    <ModulePageHeader
      icon={PackagePlus}
      title={t(`catalog.create.title.${entity}`)}
      description={t(quickMode ? 'productSetup.quickAdd.headerDescription' : 'catalog.create.description')}
      actions={(
        <>
          <div className="flex items-center rounded-lg border border-[var(--border)] px-3">
            <CheckboxField label={t('productSetup.quickAdd.toggle')} checked={quickMode} onChange={setQuickMode} />
          </div>
          {!quickMode && (
            <>
              <Button variant={tutorial ? 'ai' : 'outline'} size="sm" aria-pressed={tutorial} onClick={() => setTutorial(!tutorial)}>
                <BookOpen size={14} />
                {t(tutorial ? 'catalogSetup.typeWizard.tutorial.hide' : 'catalogSetup.typeWizard.tutorial.show')}
              </Button>
              <Button variant="outline" size="sm" onClick={saveDraft} disabled={locked}>
                <Save size={14} />
                {t('productSetup.drafts.save')}
              </Button>
            </>
          )}
        </>
      )}
    />
  )

  if (quickMode) {
    return <div className="space-y-4">{header}<QuickAddMode kind={kind} lookups={formState} /></div>
  }

  return (
    <HelpScope>
      <div className="space-y-4">
        {header}
        {step === 'basics' && <CatalogSetupGuide kind={kind} context="wizard" returnTo={kind === 'service' ? '/products/new?kind=service' : '/products/new'} />}
        {step === 'basics' && (
          <DraftsPanel
            drafts={wizard.drafts}
            onOpen={(draft) => navigate(selfPath(draft.id))}
            onRemove={wizard.removeDraft}
          />
        )}
        {wizard.restoredDraft && step === 'basics' && (
          <p role="status" className="rounded-lg bg-[var(--surface-2)] p-3 text-sm text-[var(--text)]">
            {t(wizard.restoredDraft.hadImage ? 'productSetup.drafts.restoredNoImage' : 'productSetup.drafts.restored')}
          </p>
        )}
        <CreateStepper steps={steps} step={step} done={locked} onSelect={goTo} />
        {wizard.typeDefaults && ['basics', 'stock', 'relations'].includes(step) && (
          <p role="status" className="flex items-start gap-2 rounded-lg border border-[var(--ai-border)] bg-[var(--ai-bg)] p-3 text-sm text-[var(--text)]">
            <Info size={16} className="mt-0.5 shrink-0 text-[var(--ai-text)]" aria-hidden="true" />
            {t('catalog.create.typeDefaultsApplied', { type: wizard.typeDefaults.typeName, units: wizard.typeDefaults.units, relations: wizard.typeDefaults.relations })}
          </p>
        )}

        <div className={cn('grid gap-4', tutorial && 'lg:grid-cols-[minmax(0,1fr)_320px]')}>
          <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <header className="mb-4">
              <h2 className="text-base font-bold text-[var(--text)]">{t(`catalog.create.steps.${step}.title`)}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t(`catalog.create.steps.${step}.description`)}</p>
            </header>
            <fieldset disabled={locked && step !== 'review'} className="min-w-0">
              {step === 'basics' && <BasicsStep wizard={wizard} onQuickType={() => setDialog('type')} onQuickCategory={() => setDialog('category')} />}
              {step === 'stock' && <StockStep wizard={wizard} onCreateUnit={() => setDialog('unit')} />}
              {step === 'capabilities' && <DetailsStep wizard={wizard} />}
              {step === 'relations' && <RelationsStep wizard={wizard} />}
              {step === 'instances' && (
                <InstancesStep
                  itemType={wizard.itemType}
                  modes={wizard.instanceModes}
                  value={wizard.instances}
                  onChange={wizard.setInstances}
                  invalid={wizard.plan.instances.invalid}
                  count={wizard.plan.instances.instances.length}
                  onQuickType={() => setDialog('type')}
                />
              )}
              {step === 'review' && <ReviewStep wizard={wizard} onEdit={goTo} />}
            </fieldset>
            {locked && step !== 'review' && <p className="mt-3 text-xs text-[var(--text-muted)]">{t('catalog.create.lockedNote')}</p>}
          </section>
          {tutorial && (
            <TutorialPanel
              guideKey={`productSetup.steps.${step}.guide`}
              extra={<StepTypeNote step={step} itemType={wizard.itemType} typeDefaults={wizard.typeDefaults} />}
            />
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" onClick={() => (index === 0 ? navigate(listPath) : goTo(steps[index - 1]))} disabled={wizard.submitting}>
            <ArrowLeft size={15} className="rtl:rotate-180" />
            {index === 0 ? t('actions.cancel') : t('actions.back')}
          </Button>
          {step === 'review' ? (
            <Button onClick={save} loading={wizard.submitting} disabled={wizard.submitting}>
              {wizard.error ? t('catalog.create.retry') : locked ? t('catalog.create.finish') : t('catalog.create.save')}
            </Button>
          ) : (
            <Button onClick={() => goTo(steps[index + 1])}>{t('actions.next')}<ArrowRight size={15} className="rtl:rotate-180" /></Button>
          )}
        </footer>

        <QuickItemTypeDialog
          open={dialog === 'type'}
          kind={formState.form.kind || kind}
          onClose={() => setDialog(null)}
          onOpenFull={openFullTypePage}
          onSaved={(id) => {
            if (!id) return
            formState.update('item_type_id', String(id))
            formState.update('capability_values', {})
          }}
        />
        <QuickCategoryDialog
          open={dialog === 'category'}
          kind={kind}
          categories={formState.categories}
          parentId={formState.form.category_id}
          onClose={() => setDialog(null)}
          onSaved={(id) => id && formState.update('category_id', String(id))}
        />
        <UnitFormDialog
          open={dialog === 'unit'}
          unit={null}
          onClose={() => setDialog(null)}
          onSaved={(id) => {
            if (!id) return
            formState.update('units', [...(formState.form.units || []), { key: `unit-new-${id}`, unit_id: String(id), factor: '', price: '', barcode: '', is_default: false }])
          }}
        />
      </div>
    </HelpScope>
  )
}
