import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react'
import { ModulePageHeader } from '../../../../shared/components/module-pages'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../../shared/components/ui/Button'
import { useDealCreateWizard } from '../../hooks/useDealCreateWizard'
import { WIZARD_STEPS, validateWizardStep } from '../../utils/dealWizard'
import { BasicsStep } from './BasicsStep'
import { PipelineStep } from './PipelineStep'
import { ProductsStep } from './ProductsStep'
import { ReviewStep } from './ReviewStep'
import { TeamStep } from './TeamStep'
import { WizardStepper } from './WizardStepper'

/**
 * `/deals/new` — create a deal in steps: stages → first data → products → team → review & create.
 * Answers are kept as a draft in this browser until the deal is created (see useDealCreateWizard).
 */
export function DealCreateWizard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const wizard = useDealCreateWizard()
  const { state, step, goTo, update } = wizard
  const [showErrors, setShowErrors] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const index = WIZARD_STEPS.indexOf(step)
  const errors = showErrors ? validateWizardStep(step, state) : {}
  const locked = Boolean(wizard.created.dealId)

  const next = () => {
    if (Object.keys(validateWizardStep(step, state)).length) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    goTo(WIZARD_STEPS[index + 1])
  }
  const back = () => {
    setShowErrors(false)
    if (index === 0) navigate('/deals')
    else goTo(WIZARD_STEPS[index - 1])
  }

  return (
    <div className="space-y-4">
      <ModulePageHeader
        icon={Sparkles}
        title={t('dealWorkspace.wizard.title')}
        description={t('dealWorkspace.wizard.description')}
        actions={wizard.hasDraft && !wizard.submitting ? <Button variant="outline" size="sm" onClick={() => setConfirmReset(true)}><RotateCcw size={14} />{t('dealWorkspace.wizard.startOver')}</Button> : null}
      />
      <WizardStepper step={step} state={state} onSelect={(id) => { setShowErrors(false); goTo(id) }} />

      <section className="rounded-lg border border-[var(--border)] bg-[var(--brand-bg)] p-4">
        <header className="mb-4">
          <h2 className="text-base font-bold text-[var(--text)]">{t(`dealWorkspace.wizard.steps.${step}.title`)}</h2>
          <p className="text-sm text-[var(--text-muted)]">{t(`dealWorkspace.wizard.steps.${step}.description`)}</p>
        </header>
        <fieldset disabled={locked && step !== 'review'} className="min-w-0">
          {step === 'pipeline' && <PipelineStep value={state.pipeline} onChange={(patch) => update('pipeline', patch)} errors={errors} />}
          {step === 'basics' && <BasicsStep value={state.basics} onChange={(patch) => update('basics', patch)} errors={errors} />}
          {step === 'products' && <ProductsStep value={state.products} onChange={(patch) => update('products', patch)} />}
          {step === 'team' && <TeamStep value={state.team} ownerId={state.basics.owner_id} onChange={(patch) => update('team', patch)} errors={errors} />}
          {step === 'review' && <ReviewStep state={state} created={wizard.created} progress={wizard.progress} error={wizard.error} onEdit={goTo} />}
        </fieldset>
        {locked && step !== 'review' && <p className="mt-3 text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.lockedNote')}</p>}
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" onClick={back} disabled={wizard.submitting}><ArrowLeft size={15} className="rtl:rotate-180" />{index === 0 ? t('dealWorkspace.wizard.cancel') : t('dealWorkspace.wizard.back')}</Button>
        {step === 'review' ? (
          <Button onClick={wizard.submit} loading={wizard.submitting} disabled={wizard.submitting}>
            {wizard.error ? t('dealWorkspace.wizard.retry') : wizard.created.dealId ? t('dealWorkspace.wizard.finish') : t('dealWorkspace.wizard.create')}
          </Button>
        ) : (
          <Button onClick={next}>{t('dealWorkspace.wizard.next')}<ArrowRight size={15} className="rtl:rotate-180" /></Button>
        )}
      </footer>

      <ConfirmDialog
        isOpen={confirmReset}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => { wizard.reset(); setConfirmReset(false); setShowErrors(false) }}
        title={t('dealWorkspace.wizard.startOver')}
        message={wizard.created.dealId ? t('dealWorkspace.wizard.startOverCreated') : t('dealWorkspace.wizard.startOverMessage')}
        confirmText={t('dealWorkspace.wizard.startOver')}
        cancelText={t('dealWorkspace.common.cancel')}
        type="danger"
      />
    </div>
  )
}
