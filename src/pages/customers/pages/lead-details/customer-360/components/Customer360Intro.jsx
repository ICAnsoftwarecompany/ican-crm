import { useTranslation } from 'react-i18next'
import { LayoutDashboard } from 'lucide-react'

export function Customer360Intro({ customerId }) {
  const { t } = useTranslation()

  return (
    <header className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><LayoutDashboard size={17} /></span>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-900">{t('customers.leadDetails.unifiedProfile')}</h1>
          <p className="text-[11px] text-slate-500">{t('customers.leadDetails.workspaceSubtitle')}</p>
        </div>
      </div>
      <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-600">{t('customers.leadDetails.recordNumber', { id: customerId })}</span>
    </header>
  )
}
