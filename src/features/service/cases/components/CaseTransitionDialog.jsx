import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'

const TEXTAREA_CLASS =
  'min-h-[96px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

/**
 * Collects the fields a transition requires (today: resolution code and
 * summary when resolving). Field list comes from the pipeline transition —
 * never hardcoded per status.
 */
export function CaseTransitionDialog({ open, target, setup, loading, error, onSubmit, onClose }) {
  const { t, i18n } = useTranslation()
  const [values, setValues] = useState({ resolution_code: '', resolution_summary: '' })
  const fieldErrors = getServiceFieldErrors(error)
  const required = target?.requiredFields || []

  useEffect(() => {
    if (open) setValues({ resolution_code: '', resolution_summary: '' })
  }, [open])

  const codeOptions = (setup?.resolution_codes || []).map((code) => ({
    value: code.key,
    label: localizeLabel(code.label, i18n.language, code.key),
  }))
  const missing = required.some((field) => !String(values[field] || '').trim())

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={t('service.cases.transition.title', { status: localizeLabel(target?.status?.label, i18n.language) })}
      description={t('service.cases.transition.description')}
      submitText={t('service.cases.transition.submit')}
      loading={loading}
      submitDisabled={missing}
      onSubmit={() => onSubmit(values)}
    >
      <div className="grid gap-4">
        {required.includes('resolution_code') && (
          <Select
            label={t('service.cases.fields.resolutionCode')}
            options={codeOptions}
            value={values.resolution_code}
            onChange={(value) => setValues((current) => ({ ...current, resolution_code: value }))}
            error={fieldErrors.resolution_code && t('service.cases.validation.required')}
          />
        )}
        {required.includes('resolution_summary') && (
          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            {t('service.cases.fields.resolutionSummary')}
            <textarea
              className={TEXTAREA_CLASS}
              value={values.resolution_summary}
              placeholder={t('service.cases.transition.summaryPlaceholder')}
              onChange={(event) => setValues((current) => ({ ...current, resolution_summary: event.target.value }))}
            />
          </label>
        )}
      </div>
    </FormDialog>
  )
}
