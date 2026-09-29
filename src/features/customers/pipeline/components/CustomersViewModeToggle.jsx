import { useTranslation } from 'react-i18next'
import { Columns3, Table2 } from 'lucide-react'

import { cn } from '../../../../shared/utils/cn'
import { CUSTOMERS_VIEW_MODES } from '../constants'

const OPTIONS = [
  { value: CUSTOMERS_VIEW_MODES.TABLE, icon: Table2, labelKey: 'customers.pipeline.viewMode.table' },
  { value: CUSTOMERS_VIEW_MODES.PIPELINE, icon: Columns3, labelKey: 'customers.pipeline.viewMode.pipeline' },
]

export function CustomersViewModeToggle({ value, onChange, className }) {
  const { t } = useTranslation()

  return (
    <div
      role="radiogroup"
      aria-label={t('customers.pipeline.viewMode.label')}
      className={cn('inline-flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-0.5', className)}
    >
      {OPTIONS.map(({ value: optionValue, icon: Icon, labelKey }) => {
        const active = value === optionValue
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange?.(optionValue)}
            title={t(labelKey)}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-bold transition-colors',
              active
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{t(labelKey)}</span>
          </button>
        )
      })}
    </div>
  )
}
