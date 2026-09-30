import { useTranslation } from 'react-i18next'
import { CalendarClock, PhoneCall, Presentation } from 'lucide-react'
import { formatTime } from '../../../shared/utils/dateTime'
import { MyWorkSectionCard } from '../components/MyWorkSectionCard'
import { MyWorkItemList, MyWorkItemRow } from '../components/MyWorkItemRow'
import { useMyActivities } from '../hooks/useMyActivities'
import { useMyWorkPreview } from '../hooks/useMyWorkPreview'

/** Today's calls and meetings (customer and internal) where I am the assignee or a participant. */
export function TodayActivitiesSection() {
  const { t, i18n } = useTranslation()
  const activities = useMyActivities()
  const { openActivity, drawers } = useMyWorkPreview({ onChanged: activities.refetch })
  const now = Date.now()

  return (
    <>
      <MyWorkSectionCard
        id="today"
        icon={CalendarClock}
        title={t('myWork.sections.today.title')}
        count={activities.today.length}
        viewAllTo="/calendar"
        viewAllLabel={t('myWork.sections.today.viewAll')}
        isLoading={activities.isLoading}
        error={activities.error}
        onRetry={activities.refetch}
        empty={!activities.today.length}
        emptyText={t('myWork.sections.today.empty')}
      >
        <MyWorkItemList>
          {activities.today.map((activity) => (
            <MyWorkItemRow
              key={activity.id}
              icon={activity.type === 'call' ? PhoneCall : Presentation}
              title={activity.title}
              meta={activity.relatedEntity?.name || t(`myWork.kinds.${activity.type === 'call' ? 'call' : 'meeting'}`)}
              time={formatTime(activity.startAt, i18n.language)}
              overdue={new Date(activity.startAt).getTime() < now && activity.status === 'scheduled'}
              onClick={() => openActivity(activity)}
            />
          ))}
        </MyWorkItemList>
      </MyWorkSectionCard>
      {drawers}
    </>
  )
}
