import { CalendarDays, Plus, PhoneCall, UsersRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../../shared/components/ui/Button'

export function ActivityHeader({ onCreate, onCreateCall, onCreateMeeting }) {
  const { t } = useTranslation()

  return (
    <section className="rounded-lg border border-[#BEEFF2] bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
              <CalendarDays size={21} />
            </span>
            <div>
              <h1 className="text-xl font-black text-[var(--text)]">{t('nav.activities')}</h1>
              <p className="text-sm font-semibold text-[var(--text-muted)]">{t('activities.header.description')}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onCreateCall}>
            <PhoneCall size={15} />
            {t('activities.type.call')}
          </Button>
          <Button variant="outline" onClick={onCreateMeeting}>
            <UsersRound size={15} />
            {t('activities.type.meeting')}
          </Button>
          <Button variant="ai" onClick={onCreate}>
            <Plus size={15} />
            {t('activities.header.newActivity')}
          </Button>
        </div>
      </div>
    </section>
  )
}
