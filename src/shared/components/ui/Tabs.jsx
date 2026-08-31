import { cn } from '../../utils/cn'

const variants = {
  default: {
    nav: 'border-b border-[var(--border)]',
    tab: 'px-4 py-3 border-b-2 border-transparent hover:border-[var(--border)] transition-colors',
    tabActive: 'border-[#00C2CB] text-[#00C2CB]',
    tabInactive: 'text-[var(--text-light)] hover:text-[var(--text)]',
  },
  underline: {
    nav: 'border-b border-[var(--border)]',
    tab: 'px-4 py-2 text-sm font-medium transition-colors',
    tabActive: 'text-[#00C2CB] border-b-2 border-[#00C2CB]',
    tabInactive: 'text-[var(--text-light)] hover:text-[var(--text)]',
  },
}

export function Tabs({
  items = [],
  active,
  onChange,
  variant = 'default',
  className,
}) {
  const variantStyles = variants[variant]

  return (
    <div className={className}>
      <div
        className={cn(
          'flex overflow-x-auto',
          variantStyles.nav
        )}
        role="tablist"
      >
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'font-arabic whitespace-nowrap',
              variantStyles.tab,
              active === item.id
                ? cn('font-medium', variantStyles.tabActive)
                : variantStyles.tabInactive,
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]'
            )}
            role="tab"
            aria-selected={active === item.id}
            aria-controls={`tabpanel-${item.id}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {items.map((item) => (
          <div
            key={item.id}
            id={`tabpanel-${item.id}`}
            role="tabpanel"
            hidden={active !== item.id}
            aria-labelledby={`tab-${item.id}`}
          >
            {active === item.id && item.content}
          </div>
        ))}
      </div>
    </div>
  )
}
