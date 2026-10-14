import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ListTodo } from 'lucide-react'
import { toast } from 'sonner'
import { ModulePageHeader } from '../../../../shared/components/module-pages'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { HelpScope } from '../../components/common/HelpTip'
import { TutorialPanel } from '../../components/common/TutorialPanel'
import { usePersistentFlag } from '../../hooks/usePersistentFlag'
import { formatApiError } from '../../utils/apiErrors'
import { CompletenessMeter } from '../components/CompletenessMeter'
import { useProductCompletion } from '../hooks/useProductCompletion'
import { productCompleteness } from '../utils/productCompleteness'
import { CompletionField } from './CompletionField'
import { CompletionReview } from './CompletionReview'

function Steps({ steps, step, onSelect }) {
  const { t } = useTranslation()
  const current = steps.indexOf(step)
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1" aria-label={t('productDetails.complete.stepsLabel')}>
      {steps.map((id, index) => (
        <li key={id} className="min-w-[120px] flex-1">
          <button
            type="button"
            onClick={() => onSelect(id)}
            aria-current={id === step ? 'step' : undefined}
            className={cn('flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-start text-sm font-semibold text-[var(--text)]', id === step ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]')}
          >
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs', index < current ? 'bg-[var(--brand-accent)] text-white' : 'bg-[var(--surface-2)]')}>{index + 1}</span>
            <span className="truncate">{t(`productDetails.complete.steps.${id}.title`)}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}

/**
 * `/products/:productId/complete` (2026-10-15): fills only what the product / service is missing, one step per item,
 * with the same guide panel as the add wizard, then saves once and goes back to the item.
 */
export function ProductCompleteWizard({ productId }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const completion = useProductCompletion({ productId, t })
  const [tutorial, setTutorial] = usePersistentFlag('product-tutorial', true)
  const { product, steps, step, index } = completion
  const pagePath = `/products/${productId}`

  const header = (
    <ModulePageHeader
      icon={ListTodo}
      title={t('productDetails.complete.title', { name: product?.name || '' })}
      description={t('productDetails.complete.description')}
      actions={(
        <Button variant={tutorial ? 'ai' : 'outline'} size="sm" aria-pressed={tutorial} onClick={() => setTutorial(!tutorial)}>
          <BookOpen size={14} />
          {t(tutorial ? 'catalogSetup.typeWizard.tutorial.hide' : 'catalogSetup.typeWizard.tutorial.show')}
        </Button>
      )}
    />
  )

  if (completion.loading) return <div className="space-y-4">{header}<Skeleton className="h-64 w-full" /></div>
  if (completion.loadError || !product) {
    return (
      <div className="space-y-4">
        {header}
        <EmptyState
          title={t(completion.loadError ? 'catalog.details.loadFailed' : 'catalog.details.notFound')}
          description={completion.loadError ? formatApiError(completion.loadError, '') : undefined}
          action={completion.loadError ? <Button variant="outline" onClick={completion.retry}>{t('catalog.common.retry')}</Button> : null}
        />
      </div>
    )
  }

  const back = (
    <Link to={pagePath}>
      <Button variant="outline" size="sm"><ArrowLeft size={14} className="rtl:-scale-x-100" />{t('productDetails.complete.backToItem')}</Button>
    </Link>
  )

  if (!completion.missing.length) {
    return (
      <div className="space-y-4">
        {header}
        <section className="flex flex-col items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <CheckCircle2 size={36} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <p className="text-sm text-[var(--text)]">{t('productDetails.completeness.complete')}</p>
          {back}
        </section>
      </div>
    )
  }

  const save = async () => {
    const ok = await completion.save()
    if (!ok) return
    toast.success(t('productDetails.complete.saved'))
    navigate(pagePath)
  }

  return (
    <HelpScope>
      <div className="space-y-4">
        {header}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {back}
          <div className="w-56"><CompletenessMeter completeness={productCompleteness(completion.preview)} /></div>
        </div>
        <Steps steps={steps} step={step} onSelect={completion.goTo} />

        <div className={cn('grid gap-4', tutorial && 'lg:grid-cols-[minmax(0,1fr)_320px]')}>
          <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <header className="mb-4">
              <h2 className="text-base font-bold text-[var(--text)]">{t(`productDetails.complete.steps.${step}.title`)}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t(`productDetails.complete.steps.${step}.description`)}</p>
            </header>
            {step === 'review'
              ? <CompletionReview completion={completion} />
              : <CompletionField step={step} state={completion.formState} error={completion.stepError} />}
          </section>
          {tutorial && <TutorialPanel guideKey={`productDetails.complete.steps.${step}.guide`} />}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" onClick={index === 0 ? () => navigate(pagePath) : completion.back} disabled={completion.saving}>
            <ArrowLeft size={15} className="rtl:rotate-180" />
            {index === 0 ? t('actions.cancel') : t('actions.back')}
          </Button>
          {step === 'review' ? (
            <Button onClick={save} loading={completion.saving}>{t('productDetails.complete.save')}</Button>
          ) : (
            <div className="flex gap-2">
              {!['name', 'price'].includes(step) && <Button variant="ghost" onClick={() => completion.goTo(steps[index + 1])}>{t('productDetails.complete.later')}</Button>}
              <Button onClick={completion.next}>{t('actions.next')}<ArrowRight size={15} className="rtl:rotate-180" /></Button>
            </div>
          )}
        </footer>
      </div>
    </HelpScope>
  )
}
