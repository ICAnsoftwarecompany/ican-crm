import { PanelRightClose, PanelRightOpen } from 'lucide-react'

export function ConversationListToggle({ collapsed, onToggle, floating = false }) {
  const Icon = collapsed ? PanelRightOpen : PanelRightClose
  const label = collapsed ? 'فتح قائمة المحادثات' : 'إغلاق قائمة المحادثات'

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${floating ? 'absolute top-3 end-3 z-10' : ''} hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] shadow-sm transition hover:border-[var(--brand-accent)] hover:bg-[var(--brand-accent-soft)] hover:text-[var(--brand-accent)] xl:inline-flex`}
      aria-label={label}
      title={label}
    >
      <Icon size={16} />
    </button>
  )
}
