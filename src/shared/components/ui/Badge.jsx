import { cn } from '../../utils/cn'

const variants = {
  default:  'bg-[var(--surface-2)] text-[var(--text)]',
  success:  'bg-[#ECFDF5] text-[#065F46] dark:bg-emerald-950 dark:text-emerald-200',
  warning:  'bg-[#FFFBEB] text-[#92400E] dark:bg-amber-950 dark:text-amber-200',
  danger:   'bg-[#FEF2F2] text-[#991B1B] dark:bg-red-950 dark:text-red-200',
  info:     'bg-[#EFF6FF] text-[#1D4ED8] dark:bg-blue-950 dark:text-blue-200',
  purple:   'bg-[#F5F3FF] text-[#5B21B6] dark:bg-violet-950 dark:text-violet-200',
  ai:       'bg-[var(--ai-bg)] text-[var(--ai-text)] border border-[var(--ai-border)]',
}

export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-arabic',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
