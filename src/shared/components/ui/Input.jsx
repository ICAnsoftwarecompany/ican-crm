import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

export const Input = forwardRef(function Input(
  { className, label, error, hint, startIcon, endIcon, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium font-arabic text-[var(--text)]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {startIcon && (
          <span className="absolute start-3 text-[var(--text-muted)]">{startIcon}</span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)]',
            'px-3 text-sm font-arabic text-[var(--text)] placeholder:text-[var(--text-light)]',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'dark:bg-[var(--surface)] dark:border-[var(--border)]',
            startIcon && 'ps-9',
            endIcon && 'pe-9',
            error && 'border-[#EF4444] focus:ring-[#EF4444]',
            className
          )}
          {...props}
        />
        {endIcon && (
          <span className="absolute end-3 text-[var(--text-muted)]">{endIcon}</span>
        )}
      </div>
      {error && <p className="text-xs text-[#EF4444] font-arabic">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--text-muted)] font-arabic">{hint}</p>}
    </div>
  )
})
