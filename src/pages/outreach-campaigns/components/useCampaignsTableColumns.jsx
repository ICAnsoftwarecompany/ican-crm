import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Ban, Trash2 } from 'lucide-react'
import { Avatar } from '../../../shared/components/ui/Avatar'
import { Button } from '../../../shared/components/ui/Button'
import { useUsers } from '../../../features/users/hooks/useUsers'
import { CAMPAIGN_CHANNEL_LIST } from '../../../features/outreach-campaigns/config/campaignChannels'
import { CAMPAIGN_STATUS_FILTER_OPTIONS, getCampaignStatusConfig } from '../../../features/outreach-campaigns/constants/campaignStatus'
import { CampaignChannelBadge } from '../../../features/outreach-campaigns/components/CampaignChannelBadge'
import { CampaignStatusBadge } from '../../../features/outreach-campaigns/components/CampaignStatusBadge'

function findUserName(users, userId) {
  const user = users.find((item) => String(item.id) === String(userId))
  return user?.name || user?.email || `#${userId}`
}

/**
 * Progress/Engagement have no backend metric today (see docs "Backend
 * Gaps" — analytics section). Rendering an explicit "not available" label
 * rather than a fabricated number or a silent zero.
 */
function NotAvailableCell() {
  const { t } = useTranslation()
  return <span className="text-xs text-[var(--text-muted)]">{t('outreachCampaigns.metrics.notAvailable')}</span>
}

export function useCampaignsTableColumns({ onView, onEdit, onCancel, onDelete }) {
  const { t } = useTranslation()
  const usersQuery = useUsers()
  const users = usersQuery.data || []

  return useMemo(() => [
    {
      id: 'name',
      header: t('outreachCampaigns.table.campaign'),
      accessor: 'name',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      width: 'w-56',
      render: (row) => <span className="font-bold text-[var(--text)]">{row.name || '—'}</span>,
    },
    {
      id: 'channel',
      header: t('outreachCampaigns.table.channel'),
      accessor: 'channel',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: CAMPAIGN_CHANNEL_LIST.map((definition) => ({ value: definition.key, label: t(definition.labelKey) })),
      width: 'w-36',
      render: (row) => <CampaignChannelBadge channel={row.channel} />,
    },
    {
      id: 'audience',
      header: t('outreachCampaigns.table.audience'),
      accessor: 'customersCount',
      sortable: true,
      filterable: true,
      filterType: 'number',
      width: 'w-28',
      render: (row) => <span className="text-sm font-semibold text-[var(--text)]">{row.customersCount ?? 0}</span>,
    },
    {
      id: 'status',
      header: t('outreachCampaigns.table.status'),
      accessor: 'status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: CAMPAIGN_STATUS_FILTER_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) })),
      width: 'w-32',
      render: (row) => <CampaignStatusBadge status={row.status} />,
    },
    {
      id: 'startsAt',
      header: t('outreachCampaigns.table.startDate'),
      accessor: 'startsAt',
      sortable: true,
      filterable: true,
      filterType: 'date',
      width: 'w-40',
      render: (row) => <span className="text-sm text-[var(--text)]" dir="ltr">{row.startsAt || '—'}</span>,
    },
    {
      id: 'createdBy',
      header: t('outreachCampaigns.table.createdBy'),
      accessor: 'createdBy',
      searchable: true,
      filterable: true,
      filterType: 'text',
      width: 'w-32',
      render: (row) => <span className="text-sm text-[var(--text)]">{row.createdBy || '—'}</span>,
    },
    {
      id: 'assignedUsers',
      header: t('outreachCampaigns.table.assignedUsers'),
      accessor: 'users',
      enableFilter: false,
      sortable: false,
      width: 'w-40',
      render: (row) => {
        const userIds = (row.users || []).map((user) => user?.id ?? user?.user_id ?? user)
        if (!userIds.length) return <span className="text-xs text-[var(--text-muted)]">{t('outreachCampaigns.table.noAssignees')}</span>
        return (
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {userIds.slice(0, 3).map((userId) => (
              <Avatar key={userId} name={findUserName(users, userId)} size="sm" className="border-2 border-[var(--surface)]" />
            ))}
            {userIds.length > 3 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--surface-2)] text-[10px] font-bold text-[var(--text-muted)]">
                +{userIds.length - 3}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'progress',
      header: t('outreachCampaigns.table.progress'),
      accessor: 'id',
      enableFilter: false,
      sortable: false,
      width: 'w-32',
      render: () => <NotAvailableCell />,
    },
    {
      id: 'engagement',
      header: t('outreachCampaigns.table.engagement'),
      accessor: 'id',
      enableFilter: false,
      sortable: false,
      width: 'w-32',
      render: () => <NotAvailableCell />,
    },
    {
      id: 'updatedAt',
      header: t('outreachCampaigns.table.lastUpdated'),
      accessor: 'updatedAt',
      sortable: true,
      filterable: true,
      filterType: 'date',
      width: 'w-40',
      render: (row) => <span className="text-sm text-[var(--text)]" dir="ltr">{row.updatedAt || '—'}</span>,
    },
    {
      id: 'actions',
      header: t('outreachCampaigns.table.actions'),
      accessor: 'id',
      enableFilter: false,
      sortable: false,
      width: 'w-40',
      render: (row) => {
        const statusConfig = getCampaignStatusConfig(row.status)
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onView(row)} aria-label={t('outreachCampaigns.actions.view')}>
              <Eye size={16} />
            </Button>
            {statusConfig.canEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(row)} aria-label={t('outreachCampaigns.actions.edit')}>
                <Pencil size={16} />
              </Button>
            )}
            {statusConfig.canCancel && (
              <Button variant="ghost" size="icon" onClick={() => onCancel(row)} aria-label={t('outreachCampaigns.actions.cancel')}>
                <Ban size={16} />
              </Button>
            )}
            {statusConfig.canDelete && (
              <Button variant="ghost" size="icon" className="text-[#EF4444]" onClick={() => onDelete(row)} aria-label={t('outreachCampaigns.actions.delete')}>
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        )
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, users, onView, onEdit, onCancel, onDelete])
}
