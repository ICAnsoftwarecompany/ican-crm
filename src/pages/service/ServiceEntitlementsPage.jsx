import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BadgeCheck } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { Select } from '../../shared/components/ui/Select'
import { EntitlementsList } from '../../features/service'

const STATUSES = ['active', 'exhausted', 'expired', 'suspended']

/** /service/entitlements — what customers are entitled to, with balances. */
export function ServiceEntitlementsPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState('')
  usePageHeader({ title: t('service.hub.title'), icon: BadgeCheck })
  return (
    <div className="grid gap-4">
      <div className="w-56">
        <Select aria-label={t('service.entitlements.status')} placeholder={t('service.entitlements.allStatuses')} value={status} onChange={setStatus} options={STATUSES.map((value) => ({ value, label: t(`service.entitlements.statuses.${value}`) }))} />
      </div>
      <EntitlementsList params={status ? { status } : {}} />
    </div>
  )
}

export default ServiceEntitlementsPage
