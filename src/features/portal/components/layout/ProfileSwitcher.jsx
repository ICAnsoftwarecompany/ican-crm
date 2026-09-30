import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Select } from '../../../../shared/components/ui/Select'
import { useSwitchMembership } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'

/** One person, several memberships (guardian of two families, user of two companies) → pick who you act for. */
export function ProfileSwitcher() {
  const { t } = useTranslation()
  const { me } = usePortalAccess()
  const switchMembership = useSwitchMembership()
  if (!me || (me.memberships || []).length < 2) return null
  return (
    <div className="w-64 max-w-full">
      <Select
        aria-label={t('portal.profile.switch')}
        value={me.active_membership_id}
        disabled={switchMembership.isPending}
        onChange={(id) => id && id !== me.active_membership_id && switchMembership.mutate(id, { onSuccess: () => toast.success(t('portal.profile.switched')) })}
        options={me.memberships.map((membership) => ({ value: membership.id, label: `${membership.customer?.name} · ${t(`portal.membershipTypes.${membership.membership_type}`)}` }))}
      />
    </div>
  )
}
