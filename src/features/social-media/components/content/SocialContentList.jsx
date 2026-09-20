import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../../../../shared/components/data-table'
import { Badge } from '../../../../shared/components/ui/Badge'
import { SocialPlatformBadge } from '../SocialPlatformBadge'
import { formatMetric, formatContentDateTime, truncateCaption } from '../../utils/socialFormatters'

const STATUS_VARIANT = { published: 'success', scheduled: 'info', draft: 'default', failed: 'danger' }

/**
 * Reuses the shared DataTable exactly like `CampaignListTable.jsx` does —
 * no new table engine (see docs "List View"). Only the columns that make
 * sense for social content are enabled; export/column-visibility stay on
 * since DataTable already provides them generically, but sorting is
 * limited to fields that are genuinely sortable client-side data.
 */
export function SocialContentList({ items, isLoading, error, onRetry, onOpen }) {
  const { t, i18n } = useTranslation()

  const columns = useMemo(() => [
    {
      id: 'content',
      header: t('socialMedia.content.columns.content'),
      accessor: 'message',
      searchable: true,
      render: (row) => <span className="font-bold text-[var(--text)]">{truncateCaption(row.message, 60) || t('socialMedia.content.untitled')}</span>,
    },
    { id: 'platform', header: t('socialMedia.content.columns.platform'), accessor: 'platform', render: (row) => <SocialPlatformBadge platform={row.platform} /> },
    { id: 'type', header: t('socialMedia.content.columns.type'), accessor: 'mediaType', render: (row) => t(`socialMedia.mediaType.${row.mediaType}`) },
    { id: 'publishedAt', header: t('socialMedia.content.columns.publishedAt'), accessor: 'publishedAt', sortable: true, render: (row) => <span dir="ltr">{formatContentDateTime(row.publishedAt, i18n.language)}</span> },
    { id: 'likes', header: t('socialMedia.content.columns.likes'), accessor: 'engagement.likes', sortable: true, render: (row) => <span dir="ltr">{formatMetric(row.engagement.likes, i18n.language)}</span> },
    { id: 'comments', header: t('socialMedia.content.columns.comments'), accessor: 'engagement.comments', sortable: true, render: (row) => <span dir="ltr">{formatMetric(row.engagement.comments, i18n.language)}</span> },
    { id: 'shares', header: t('socialMedia.content.columns.shares'), accessor: 'engagement.shares', sortable: true, render: (row) => <span dir="ltr">{formatMetric(row.engagement.shares, i18n.language)}</span> },
    { id: 'status', header: t('socialMedia.content.columns.status'), accessor: 'status', render: (row) => <Badge variant={STATUS_VARIANT[row.status] || 'default'}>{t(`socialMedia.contentStatus.${row.status}`)}</Badge> },
  ], [t, i18n.language])

  return (
    <DataTable
      data={items}
      columns={columns}
      tableId="social-media-content"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onRowClick={onOpen}
      emptyMessage={t('socialMedia.emptyStates.noContent.title')}
      enableSorting
      enableGlobalSearch
      enableColumnVisibility
      enablePagination
      showToolbar
      showFooter
    />
  )
}
