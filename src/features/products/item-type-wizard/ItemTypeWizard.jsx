import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Layers } from 'lucide-react'
import { ModulePageHeader } from '../../../shared/components/module-pages'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { Skeleton } from '../../../shared/components/feedback/Skeleton'
import { Button } from '../../../shared/components/ui/Button'
import { cn } from '../../../shared/utils/cn'
import { HelpScope } from '../components/common/HelpTip'
import { BasicsStep } from './steps/BasicsStep'
import { CapabilitiesStep } from './steps/CapabilitiesStep'
import { KindStep } from './steps/KindStep'
import { TutorialPanel } from '../components/common/TutorialPanel'
import { TypeRelationsStep } from './steps/TypeRelationsStep'
import { TypeReviewStep } from './steps/TypeReviewStep'
import { UnitsStep } from './steps/UnitsStep'
import { useItemTypeWizard } from './hooks/useItemTypeWizard'

const STEP_COMPONENTS = {
  kind: KindStep,
  basics: BasicsStep,
  capabilities: CapabilitiesStep,
  units: UnitsStep,
  relations: TypeRelationsStep,
  review: TypeReviewStep,
}

function Stepper({ steps, step, onSelect }) {
  const { t } = useTranslation()
  const current = steps.indexOf(step)
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1" aria-label={t('catalogSetup.typeWizard.stepsLabel')}>
      {steps.map((id, index) => (
        <li key={id} className="min-w-[130px] flex-1">
          <button
            type="button"
            onClick={() => onSelect(id)}
            aria-current={id === step ? 'step' : undefined}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-start transition-colors',
              id === step ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
            )}
          >
            <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', index < current ? 'bg-[var(--brand-accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text)]')}>
              {index < current ? <Check size={14} /> : index + 1}
            </span>
            <span className="block truncate text-sm font-semibold text-[var(--text)]">{t(`catalogSetup.typeWizard.steps.${id}.title`)}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function SavedPanel({ saved, mode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const kindQuery = saved.kind === 'service' ? 'kind=service&' : ''
  return (
    <section className="flex flex-col items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center" role="status">
      <CheckCircle2 size={40} className="text-[#10B981]" aria-hidden="true" />
      <h2 className="text-lg font-bold text-[var(--text)]">{t(mode === 'edit' ? 'catalogSetup.typeWizard.saved.updated' : 'catalogSetup.typeWizard.saved.created', { name: saved.name })}</h2>
      <p className="max-w-lg text-sm text-[var(--text-muted)]">{t('catalogSetup.typeWizard.saved.hint')}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {['product', 'service'].includes(saved.kind) && saved.id && (
          <Button onClick={() => navigate(`/products/new?${kindQuery}item_type=${encodeURIComponent(saved.id)}`)}>
            {t(`catalogSetup.typeWizard.saved.addItem.${saved.kind}`)}
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate('/products/item-types')}>{t('catalogSetup.typeWizard.saved.backToList')}</Button>
      </div>
    </section>
  )
}

/**
 * `/products/item-types/new` and `/products/item-types/:id` (2026-10-14): a full page that builds an item type in
 * stages, with an optional tutorial panel (remembered per browser) and ready templates for every kind of business.
 */
export function ItemTypeWizard({ mode = 'create', itemTypeId, initialKind, returnTo }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const wizard = useItemTypeWizard({ mode, itemTypeId, initialKind, returnTo, t })
  const { steps, step, index, tutorial, setTutorial } = wizard
  const StepComponent = STEP_COMPONENTS[step]
  const cancel = () => navigate(wizard.returnTo || '/products/item-types')

  const header = (
    <ModulePageHeader
      icon={Layers}
      title={t(mode === 'edit' ? 'catalogSetup.typeWizard.editTitle' : 'catalogSetup.typeWizard.title')}
      description={t('catalogSetup.typeWizard.description')}
      actions={(
        <Button variant={tutorial ? 'ai' : 'outline'} size="sm" aria-pressed={tutorial} onClick={() => setTutorial(!tutorial)}>
          <BookOpen size={14} />
          {t(tutorial ? 'catalogSetup.typeWizard.tutorial.hide' : 'catalogSetup.typeWizard.tutorial.show')}
        </Button>
      )}
    />
  )

  if (wizard.saved) {
    return <div className="space-y-4">{header}<SavedPanel saved={wizard.saved} mode={mode} /></div>
  }
  if (wizard.loading) {
    return <div className="space-y-4">{header}<Skeleton className="h-64 w-full" /></div>
  }
  if (wizard.loadError || wizard.notFound) {
    return (
      <div className="space-y-4">
        {header}
        <EmptyState
          title={t(wizard.notFound ? 'catalogSetup.typeWizard.notFound' : 'catalogSetup.typeWizard.loadFailed')}
          action={wizard.loadError ? <Button variant="outline" onClick={wizard.retryLoad}>{t('catalog.common.retry')}</Button> : null}
        />
      </div>
    )
  }

  return (
    <HelpScope>
      <div className="space-y-4">
        {header}
        <Stepper steps={steps} step={step} onSelect={wizard.goTo} />

        <div className={cn('grid gap-4', tutorial && 'lg:grid-cols-[minmax(0,1fr)_320px]')}>
          <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <header className="mb-4">
              <h2 className="text-base font-bold text-[var(--text)]">{t(`catalogSetup.typeWizard.steps.${step}.title`)}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t(`catalogSetup.typeWizard.steps.${step}.description`)}</p>
            </header>
            <StepComponent wizard={wizard} />
          </section>
          {tutorial && <TutorialPanel guideKey={`catalogSetup.typeWizard.steps.${step}.guide`} />}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" onClick={index === 0 ? cancel : wizard.back} disabled={wizard.submitting}>
            <ArrowLeft size={15} className="rtl:rotate-180" />
            {index === 0 ? t('actions.cancel') : t('actions.back')}
          </Button>
          {step === 'review' ? (
            <Button onClick={wizard.submit} loading={wizard.submitting} disabled={wizard.submitting}>
              {t(mode === 'edit' ? 'catalog.common.saveChanges' : 'catalogSetup.typeWizard.save')}
            </Button>
          ) : (
            <Button onClick={wizard.next}>{t('actions.next')}<ArrowRight size={15} className="rtl:rotate-180" /></Button>
          )}
        </footer>
      </div>
    </HelpScope>
  )
}
