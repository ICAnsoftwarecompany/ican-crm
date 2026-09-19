import { useTranslation } from 'react-i18next'

const inputClassName = 'h-10 w-full min-w-0 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'
const textareaClassName = 'min-h-24 w-full min-w-0 resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold leading-6 text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'

export function AfterMeetingFieldRenderer({ field, value, onChange }) {
  const { t } = useTranslation()
  const label = (
    <span>
      {field.label}
      {field.required ? <span className="ms-1 text-red-500">*</span> : null}
    </span>
  )

  return (
    <label className="block min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
      {label}

      {field.type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          className={textareaClassName}
        />
      ) : null}

      {field.type === 'select' ? (
        <select
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
        >
          <option value="">{t('activities.afterMeetingReport.chooseOption')}</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : null}

      {field.type !== 'textarea' && field.type !== 'select' ? (
        <input
          type={field.type === 'date' ? 'date' : 'text'}
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
        />
      ) : null}
    </label>
  )
}
