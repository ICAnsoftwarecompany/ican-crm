import { Cable, LockKeyhole, PackageX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { Button } from '../../../shared/components/ui/Button'

const icons = { disconnected: Cable, permission: LockKeyhole, package: PackageX, unavailable: PackageX }

export function CampaignUnavailableState({ reason = 'unavailable' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const Icon = icons[reason] || PackageX
  const action = reason === 'disconnected' ? <Button variant="outline" onClick={() => navigate('/settings/integrations')}>{t('campaigns.states.disconnected.action')}</Button> : null
  return <EmptyState icon={<Icon size={24} />} title={t(`campaigns.states.${reason}.title`)} description={t(`campaigns.states.${reason}.description`)} action={action} />
}
