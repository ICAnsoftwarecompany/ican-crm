import { LayoutDashboard } from 'lucide-react'

export function Customer360Intro({ customerId }) {
  return (
    <header dir="rtl" className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><LayoutDashboard size={17} /></span>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-900">ملف العميل الموحد</h1>
          <p className="text-[11px] text-slate-500">Customer 360 · مساحة متابعة العميل</p>
        </div>
      </div>
      <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-600">رقم السجل: {customerId}</span>
    </header>
  )
}
