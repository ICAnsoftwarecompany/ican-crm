import { LayoutDashboard, ShieldCheck } from 'lucide-react'

export function Customer360Intro({ customerId }) {
  return (
    <section dir="rtl" className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="absolute inset-y-0 right-0 w-1 bg-indigo-600" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><LayoutDashboard size={24} /></div>
          <div><p className="text-xs font-semibold text-indigo-600">Lead Center / Customer 360</p><h1 className="mt-1 text-xl font-bold text-slate-900">ملف العميل الموحد</h1><p className="mt-1 text-sm text-slate-500">بيانات العميل وتفاعلاته وإجراءاته في مساحة واحدة</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"><ShieldCheck size={16} className="text-emerald-600" /><span>رقم السجل: {customerId}</span></div>
      </div>
    </section>
  )
}
