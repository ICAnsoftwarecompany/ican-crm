export function DefaultActivity({ activity }) {
  const description = activity?.description || ''

  if (!description) {
    return <p className="text-sm font-semibold text-slate-500">لا توجد تفاصيل إضافية</p>
  }

  return <p className="text-sm font-semibold text-slate-700">{description}</p>
}
