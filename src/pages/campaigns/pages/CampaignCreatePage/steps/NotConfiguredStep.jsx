import { PackageX } from 'lucide-react'
import { EmptyState } from '../../../../../shared/components/feedback/EmptyState'

export function NotConfiguredStep({ t }) {
  return (
    <EmptyState
      icon={<PackageX size={24} />}
      title={t('campaigns.states.notConfigured.title')}
      description={t('campaigns.states.notConfigured.description')}
    />
  )
}
