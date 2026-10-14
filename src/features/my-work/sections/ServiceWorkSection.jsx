import { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'
import { CardSkeleton } from '../../../shared/components/feedback/Skeleton'
import { MyWorkSectionCard } from '../components/MyWorkSectionCard'

// Lazy so the Customer Hub code stays out of the My Work chunk until this section renders
// (same pattern as ConversationsPage's "Create case" button).
const ServiceMyWorkList = lazy(() =>
  import('../../service').then((module) => ({ default: module.MyWorkList }))
)

const PREVIEW_LIMIT = 5

/**
 * Customer Hub work items (cases, and whatever the backend read model adds). Renders the existing
 * `MyWorkList` from features/service — the full list stays at /service/my-work.
 */
export function ServiceWorkSection() {
  const { t } = useTranslation()

  return (
    <MyWorkSectionCard
      id="service"
      icon={Inbox}
      title={t('myWork.sections.service.title')}
      viewAllTo="/service/my-work"
    >
      <Suspense fallback={<div className="p-2"><CardSkeleton /></div>}>
        <ServiceMyWorkList limit={PREVIEW_LIMIT} />
      </Suspense>
    </MyWorkSectionCard>
  )
}
