export function MeetingReportFields({ register, inputClassName }) {
  return (
    <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
      <span>عدد الحضور</span>
      <input {...register('attendees_count')} type="number" min="0" className={inputClassName} placeholder="مثال: 3" />
    </label>
  )
}
