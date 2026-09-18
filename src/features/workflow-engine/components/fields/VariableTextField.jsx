import { useTranslation } from 'react-i18next'
import { Select } from '../../../../shared/components/ui/Select'
import { previewInterpolateVariables } from '../../utils/workflowVariables'

const SAMPLE_VALUES = {
  'customer.name': 'Ahmed Mohamed',
  'customer.email': 'ahmed@example.com',
  'customer.phone': '+201000000000',
  'lead.name': 'Ahmed Mohamed',
  'lead.source': 'Facebook',
  'lead.status': 'Interested',
  'opportunity.name': 'Renewal — Ahmed Mohamed',
  'opportunity.value': '50,000',
  'campaign.name': 'Ramadan Offers',
  'campaign.channel': 'WhatsApp',
  'user.name': 'Sales Agent',
}

/**
 * A text field that can consume workflow variables (e.g. `{{customer.name}}`).
 * The preview below the textarea is a client-side approximation only —
 * real interpolation happens server-side at send time (see
 * utils/workflowVariables.js and docs "Variables System").
 */
export function VariableTextField({ field, value = '', onChange, variables = [] }) {
  const { t } = useTranslation()

  const insertVariable = (variableKey) => {
    if (!variableKey) return
    onChange(`${value || ''}{{${variableKey}}}`)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {field.labelKey && <span className="text-sm font-medium font-arabic text-[var(--text)]">{t(field.labelKey)}</span>}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-arabic text-[var(--text)] outline-none focus:ring-2 focus:ring-[#00C2CB]"
      />
      {variables.length > 0 && (
        <Select
          placeholder={t('workflow.fields.insertVariable')}
          value=""
          onChange={insertVariable}
          options={variables.map((variable) => ({ value: variable.key, label: t(variable.labelKey) }))}
        />
      )}
      {value && (
        <p className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-xs text-[var(--text-muted)]">
          {t('workflow.fields.previewLabel')}: {previewInterpolateVariables(value, SAMPLE_VALUES)}
        </p>
      )}
    </div>
  )
}
