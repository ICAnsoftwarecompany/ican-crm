export function EmptyState({ message = 'لا توجد بيانات' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-2">📭</div>
      <h3 className="font-arabic font-medium text-[var(--text)] mb-1">{message}</h3>
      <p className="text-sm text-[var(--text-muted)]">جرب تغيير معايير البحث أو التصفية</p>
    </div>
  )
}
