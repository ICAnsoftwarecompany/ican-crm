import { useTranslation } from 'react-i18next'
import { Repeat } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { FollowUpsWorkspace } from '../../features/service'

/** /service/follow-ups */
export function ServiceFollowUpsPage() {
  const { t } = useTranslation()
  usePageHeader({ title: t('service.hub.title'), icon: Repeat })
  return <FollowUpsWorkspace />
}

export default ServiceFollowUpsPage
