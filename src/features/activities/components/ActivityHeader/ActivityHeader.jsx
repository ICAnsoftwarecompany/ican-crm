import { CalendarDays, Plus, PhoneCall, UsersRound } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'

export function ActivityHeader({ onCreate, onCreateCall, onCreateMeeting }) {
  return (
    <section className="rounded-lg border border-[#BEEFF2] bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
              <CalendarDays size={21} />
            </span>
            <div>
              <h1 className="text-xl font-black text-[var(--text)]">الأنشطة</h1>
              <p className="text-sm font-semibold text-[var(--text-muted)]">إدارة كل المكالمات والاجتماعات لكل العملاء المحتملين من مكان واحد.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onCreateCall}>
            <PhoneCall size={15} />
            مكالمة
          </Button>
          <Button variant="outline" onClick={onCreateMeeting}>
            <UsersRound size={15} />
            اجتماع
          </Button>
          <Button variant="ai" onClick={onCreate}>
            <Plus size={15} />
            نشاط جديد
          </Button>
        </div>
      </div>
    </section>
  )
}
