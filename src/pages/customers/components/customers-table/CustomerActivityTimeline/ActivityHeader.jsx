import { formatRelativeActivityTime } from './utils/formatActivityDate'

export function ActivityHeader({ totalCount, lastActivityDate }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <h3 className="text-sm font-black text-slate-900">خط سير نشاط العميل</h3>
      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
        <span>{totalCount} نشاط</span>
        <span className="text-slate-400">•</span>
        <span>آخر نشاط: {lastActivityDate ? formatRelativeActivityTime(lastActivityDate) : '-'}</span>
      </div>
    </div>
  )
}
