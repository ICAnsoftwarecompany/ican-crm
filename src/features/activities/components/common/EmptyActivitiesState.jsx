import { CalendarClock } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'

export function EmptyActivitiesState({ title = 'لا توجد أنشطة', description = 'أنشئ أول مكالمة أو اجتماع لبدء متابعة العملاء.', onCreate, onClearFilters }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
        <CalendarClock size={22} />
      </div>
      <h3 className="text-base font-black text-[var(--text)]">{title}</h3>
      <p className="mt-1 max-w-md text-sm font-semibold text-[var(--text-muted)]">{description}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {onCreate ? (
          <Button variant="ai" onClick={onCreate}>
            إنشاء نشاط
          </Button>
        ) : null}
        {onClearFilters ? (
          <Button variant="outline" onClick={onClearFilters}>
            مسح الفلاتر
          </Button>
        ) : null}
      </div>
    </div>
  )
}
