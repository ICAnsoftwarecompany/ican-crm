import { useTranslation } from 'react-i18next'
import { CalendarClock } from 'lucide-react'
import { PageToolbar } from '../../../shared/components/data/PageToolbar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'

/**
 * Shell only today — no scheduling/publishing API exists yet (see docs
 * "Future Publishing Architecture" / "Future Scheduling Architecture").
 * Honest "not available yet" state, no fake draft/scheduled content.
 */
export function SocialPlannerPage() {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4">
      <PageToolbar title={t('socialMedia.planner.title')} description={t('socialMedia.planner.description')} />
      <EmptyState icon={<CalendarClock size={24} />} title={t('socialMedia.planner.notAvailableTitle')} description={t('socialMedia.planner.notAvailableDescription')} />
    </div>
  )
}
