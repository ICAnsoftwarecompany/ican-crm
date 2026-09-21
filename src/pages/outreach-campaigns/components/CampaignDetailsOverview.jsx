import { useTranslation } from 'react-i18next'
import { useUsers } from '../../../features/users/hooks/useUsers'
import { Avatar } from '../../../shared/components/ui/Avatar'
import { CampaignChannelBadge } from '../../../features/outreach-campaigns/components/CampaignChannelBadge'

function findUserName(users, userId) {
  const user = users.find((item) => String(item.id) === String(userId))
  return user?.name || user?.email || `#${userId}`
}

export function CampaignDetailsOverview({ campaign }) {
  const { t } = useTranslation()
  const usersQuery = useUsers()
  const users = usersQuery.data || []
  const userIds = (campaign.users || []).map((user) => user?.id ?? user?.user_id ?? user)

  const rows = [
    { label: t('outreachCampaigns.details.channel'), value: <CampaignChannelBadge channel={campaign.channel} /> },
    { label: t('outreachCampaigns.details.startDate'), value: campaign.startsAt || '—' },
    { label: t('outreachCampaigns.details.createdBy'), value: campaign.createdBy || '—' },
    { label: t('outreachCampaigns.details.createdAt'), value: campaign.createdAt || '—' },
    { label: t('outreachCampaigns.details.updatedAt'), value: campaign.updatedAt || '—' },
  ]

  return (
    <div className="space-y-4">
      <dl className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-bold text-[var(--text-muted)]">{row.label}</dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--text)]">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <p className="mb-2 text-xs font-bold text-[var(--text-muted)]">{t('outreachCampaigns.details.assignedUsers')}</p>
        {userIds.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">{t('outreachCampaigns.table.noAssignees')}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {userIds.map((userId) => (
              <div key={userId} className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
                <Avatar name={findUserName(users, userId)} size="sm" />
                <span className="text-xs font-semibold text-[var(--text)]">{findUserName(users, userId)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
