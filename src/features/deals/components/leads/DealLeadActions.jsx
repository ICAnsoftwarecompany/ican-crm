import { useTranslation } from 'react-i18next'
import { buildDealLeadActions } from '../../utils/dealLeadActions'

export function DealLeadActions({ lead, actions }) {
  const { t } = useTranslation()
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
    {buildDealLeadActions(lead, actions, t).filter((item) => item.id !== 'deal-lead-drawer').map((item) => {
      const Icon = item.icon
      return <button type="button" key={item.id} disabled={item.disabled} onClick={item.onClick} title={item.label}
        className="flex min-h-20 min-w-0 flex-col items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 text-center text-xs text-[var(--text)] hover:bg-[var(--surface-2)] disabled:opacity-40">
        <Icon size={19} className={item.variant === 'success' ? 'text-emerald-600' : item.variant === 'danger' ? 'text-red-600' : 'text-[var(--brand-accent)]'} />
        <span className="break-words">{item.shortLabel || item.label}</span>
      </button>
    })}
  </div>
}
