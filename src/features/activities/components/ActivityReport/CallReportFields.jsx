export function CallReportFields({ register, inputClassName }) {
  return (
    <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
      <span>مدة المكالمة بالدقائق</span>
      <input {...register('duration')} type="number" min="0" className={inputClassName} placeholder="مثال: 15" />
    </label>
  )
}
