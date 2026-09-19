import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useTranslation } from 'react-i18next'

export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    value,
    onChange,
    error,
    disabled = false,
    placeholder,
    className,
    ...props
  },
  ref
) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium font-arabic text-[var(--text)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)]',
            'px-3 text-sm font-arabic text-[var(--text)]',
            'appearance-none cursor-pointer',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'dark:bg-[var(--surface)] dark:border-[var(--border)]',
            error && 'border-[#EF4444] focus:ring-[#EF4444]',
            'pe-9',
            className
          )}
          {...props}
        >
          <option value="">{placeholder ?? t('common.choose')}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className={cn(
            'absolute end-3 top-1/2 -translate-y-1/2',
            'text-[var(--text-light)] pointer-events-none'
          )}
        />
      </div>
      {error && <p className="text-xs text-[#EF4444] font-arabic">{error}</p>}
    </div>
  )
})
