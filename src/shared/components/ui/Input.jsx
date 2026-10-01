import { forwardRef, useId } from 'react'
import { cn } from '../../utils/cn'

export const Input = forwardRef(function Input(
  { className, label, error, hint, startIcon, endIcon, id, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const messageId = error || hint ? `${inputId}-message` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium font-arabic text-[var(--text)]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {startIcon && (
          <span className="absolute start-3 text-[var(--text-muted)]">{startIcon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
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
      {error && <p id={messageId} className="text-xs text-[#EF4444] font-arabic">{error}</p>}
      {hint && !error && <p id={messageId} className="text-xs text-[var(--text-muted)] font-arabic">{hint}</p>}
    </div>
  )
})
