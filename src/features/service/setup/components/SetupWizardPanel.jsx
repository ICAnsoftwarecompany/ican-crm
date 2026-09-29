import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Select } from '../../../../shared/components/ui/Select'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'
import { listText } from '../../settings/resources/resourceHelpers'
import { useApplyTemplate, useSetupTemplates } from '../api/setupApi'

const STEPS = ['template', 'models', 'terms', 'review']
const MODELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const TERM_OPTIONS = {
  customer: ['customer', 'traveler', 'guardian', 'merchant'],
  case: ['case', 'ticket', 'request'],
  record: ['record', 'serviceContract', 'booking', 'enrollment', 'shipment'],
  batch: ['batch', 'visitBatch', 'tripGroup', 'manifest'],
}
const PREVIEW_KEYS = ['case_types', 'queues', 'record_types', 'item_types', 'sla_policies']

/**
 * Setup wizard (settings section): pick an industry template, adjust business
 * models and terminology, preview with a dry run, then apply. Templates only
 * seed configuration; everything stays editable afterwards.
 */
export function SetupWizardPanel({ resource }) {
  const { t, i18n } = useTranslation()
  const templates = useSetupTemplates()
  const apply = useApplyTemplate()
  const [step, setStep] = useState(0)
  const [key, setKey] = useState('')
  const [models, setModels] = useState([])
  const [terms, setTerms] = useState({})
  const [confirm, setConfirm] = useState(false)
  const list = templates.data?.data || []
  const selected = list.find((entry) => entry.key === key)
  const Icon = resource.icon
  const termLabel = (value) => (typeof value === 'string' ? t(`service.terms.${value}.other`) : localizeLabel(value, i18n.language, ''))

  useEffect(() => {
    if (!key && templates.data?.meta?.active) setKey(templates.data.meta.active)
  }, [key, templates.data])
  useEffect(() => {
    if (selected) {
      setModels(selected.models)
      setTerms(Object.fromEntries(Object.entries(selected.terminology).map(([entity, value]) => [entity, typeof value === 'string' ? value : entity])))
    }
  }, [selected])

  const run = () =>
    apply.mutate(
      { key, models, terminology: terms },
      {
        onSuccess: () => {
          toast.success(t('service.setup.applied'))
          setConfirm(false)
          setStep(0)
        },
        onError: (error) => toast.error(getServiceErrorMessage(error, t)),
      }
    )

  return (
    <section className="grid gap-4">
      <header>
        <h1 className="flex items-center gap-2 text-lg font-bold text-[var(--text)]"><Icon size={18} aria-hidden="true" className="text-[var(--text-muted)]" />{t(`${resource.i18nKey}.title`)}</h1>
        <p className="text-sm text-[var(--text-muted)]">{t(`${resource.i18nKey}.description`)}</p>
      </header>
      <ol className="flex flex-wrap gap-2" aria-label={t('service.setup.steps')}>
        {STEPS.map((name, index) => (
          <li key={name}>
            <button type="button" disabled={index > step && !selected} onClick={() => setStep(index)} aria-current={step === index ? 'step' : undefined} className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs', step === index ? 'border-brand-accent text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)]')}>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--surface-2)]" dir="ltr">{index < step ? <Check size={12} aria-hidden="true" /> : index + 1}</span>
              {t(`service.setup.stepNames.${name}`)}
            </button>
          </li>
        ))}
      </ol>

      <ResourceState isLoading={templates.isLoading} error={templates.error} onRetry={templates.refetch}>
        <div className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((entry) => (
                <label key={entry.key} className={cn('grid cursor-pointer gap-1 rounded-lg border p-3', key === entry.key ? 'border-brand-accent' : 'border-[var(--border)]')}>
                  <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                    <input type="radio" name="template" className="accent-[var(--brand-accent)]" checked={key === entry.key} onChange={() => setKey(entry.key)} />
                    {t(`service.mock.templates.${entry.key}`)}
                    {templates.data?.meta?.active === entry.key && <span className="text-xs font-normal text-[var(--text-muted)]">{t('service.setup.current')}</span>}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{entry.models.map((model) => `${model} · ${t(`service.models.${model}.name`)}`).join(' — ')}</span>
                </label>
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {MODELS.map((model) => (
                <label key={model} className={cn('flex cursor-pointer items-start gap-3 rounded-lg border p-3', models.includes(model) ? 'border-brand-accent' : 'border-[var(--border)]')}>
                  <input type="checkbox" className="mt-1 accent-[var(--brand-accent)]" checked={models.includes(model)} onChange={(event) => setModels((current) => (event.target.checked ? [...current, model].sort() : current.filter((entry) => entry !== model)))} />
                  <span className="grid gap-0.5">
                    <span className="text-sm font-medium text-[var(--text)]"><span dir="ltr">{model}</span> · {t(`service.models.${model}.name`)}</span>
                    <span className="text-xs text-[var(--text-muted)]">{t(`service.models.${model}.description`)}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.keys(TERM_OPTIONS).map((entity) => (
                <Select key={entity} label={t(`service.setup.entities.${entity}`)} value={terms[entity] || entity} onChange={(value) => setTerms((current) => ({ ...current, [entity]: value || entity }))} options={TERM_OPTIONS[entity].map((value) => ({ value, label: termLabel(value) }))} />
              ))}
              <p className="text-xs text-[var(--text-muted)] sm:col-span-2">{t('service.setup.termsHint')}</p>
            </div>
          )}
          {step === 3 && selected && (
            <div className="grid gap-3">
              <p className="text-sm text-[var(--text)]">{t('service.setup.reviewIntro', { template: t(`service.mock.templates.${key}`) })}</p>
              <dl className="grid gap-3 sm:grid-cols-2">
                {PREVIEW_KEYS.map((name) => (
                  <div key={name} className="rounded-md bg-[var(--surface-2)] p-3">
                    <dt className="text-xs font-semibold text-[var(--text-muted)]">{t(`service.setup.preview.${name}`)}</dt>
                    <dd className="text-sm text-[var(--text)]">{listText((selected.preview[name] || []).map((label) => localizeLabel(label, i18n.language, '')), i18n.language)}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-[var(--text-muted)]">{t('service.setup.safeNote')}</p>
            </div>
          )}
          <div className="flex justify-between gap-2 border-t border-[var(--border)] pt-3">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>{t('service.setup.back')}</Button>
            {step < STEPS.length - 1 ? (
              <Button disabled={!selected || (step === 1 && !models.length)} onClick={() => setStep(step + 1)}>{t('service.setup.next')}</Button>
            ) : (
              <Button disabled={!selected || !models.length} onClick={() => setConfirm(true)}>{t('service.setup.apply')}</Button>
            )}
          </div>
        </div>
      </ResourceState>
      <ConfirmDialog isOpen={confirm} loading={apply.isPending} title={t('service.setup.confirmTitle')} message={t('service.setup.confirmMessage')} confirmText={t('service.setup.apply')} onConfirm={run} onCancel={() => setConfirm(false)} />
    </section>
  )
}
