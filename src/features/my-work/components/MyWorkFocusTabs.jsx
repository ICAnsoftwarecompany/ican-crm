import { useTranslation } from 'react-i18next'
import { cn } from '../../../shared/utils/cn'
import { MY_WORK_FOCUS_LIST } from '../constants/myWorkFocus'

/** Segmented control: all / sales / customer service. */
export function MyWorkFocusTabs({ value, onChange }) {
  const { t } = useTranslation()

  return (
    <div role="radiogroup" aria-label={t('myWork.focus.label')} className="inline-flex rounded-lg bg-[var(--surface-2)] p-1">
      {MY_WORK_FOCUS_LIST.map((focus) => (
        <button
          key={focus}
          type="button"
          role="radio"
          aria-checked={value === focus}
          onClick={() => onChange(focus)}
          className={cn(
            'h-8 rounded-md px-3 text-xs font-bold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]',
            value === focus ? 'bg-[var(--surface)] text-[var(--brand-accent)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          )}
        >
          {t(`myWork.focus.${focus}`)}
        </button>
      ))}
    </div>
  )
}
