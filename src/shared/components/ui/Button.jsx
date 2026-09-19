import { cn } from '../../utils/cn'

const variants = {
  primary:   'bg-[#162847] hover:bg-[#1D3461] text-white',
  accent:    'bg-[#00C2CB] hover:bg-[#00a8b0] text-white',
  outline:   'border border-[var(--border)] bg-transparent hover:bg-[var(--surface-2)] text-[var(--text)]',
  ghost:     'bg-transparent hover:bg-[var(--surface-2)] text-[var(--text)]',
  danger:    'bg-[#EF4444] hover:bg-[#DC2626] text-white',
  ai:        'bg-[var(--ai-bg)] hover:opacity-85 text-[var(--ai-text)] border border-[var(--ai-border)]',
}

const sizes = {
  sm:  'h-8  px-3   text-xs',
  md:  'h-9  px-4   text-sm',
  lg:  'h-10 px-5   text-sm',
  xl:  'h-11 px-6   text-base',
  icon:'h-9  w-9    p-0',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-arabic font-medium',
        'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[#00C2CB] disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
