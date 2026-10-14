import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { FileText, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react'
import { Tabs } from '../../../../shared/components/ui/Tabs'
import { useAuthStore } from '../../../../store/authStore'
import { resolveTenantId } from '../../../../services/tenantResolver'
import {
  useSocialProfiles,
  useSocialContent,
  SocialProfileHeader,
  SocialContentGrid,
  SocialContentDrawer,
  SocialMetricsCards,
  SocialContentEmptyState,
  calculateTotalEngagement,
  rankContentByEngagement,
} from '../../../../features/social-media'

/**
 * The real, working Facebook MVP page — see docs "Current Facebook MVP".
 * Profile Header + Overview/Content/Engagement tabs, all backed by the
 * genuine `getPagePosts`/`getPostEngagement`/`getPostComments` endpoints
 * via the normalized data layer. No fake data anywhere on this page.
 */
export function FacebookProfilePage() {
  const { t, i18n } = useTranslation()
  const { pageId } = useParams()
  const user = useAuthStore((state) => state.user)
  const tenantId = resolveTenantId(user)

  const [activeTab, setActiveTab] = useState('overview')
  const [openContent, setOpenContent] = useState(null)

  const profilesQuery = useSocialProfiles({ tenantId, platform: 'facebook' })
  const profile = profilesQuery.data.find((item) => item.externalId === pageId) || null

  const contentQuery = useSocialContent({ tenantId, platform: 'facebook', profileId: pageId, enabled: Boolean(pageId) })

  if (profilesQuery.isLoading) {
    return <SocialMetricsCards items={[]} />
  }

  if (!profile) {
    return <SocialContentEmptyState variant="noPages" />
  }

  const topContent = rankContentByEngagement(contentQuery.items, 4)
  const totalEngagement = contentQuery.items.reduce((sum, item) => {
    const value = calculateTotalEngagement(item.engagement)
    return value === null ? sum : sum + value
  }, 0)
  const totals = contentQuery.items.reduce(
    (acc, item) => {
      acc.likes += item.engagement.likes ?? 0
      acc.comments += item.engagement.comments ?? 0
      acc.shares += item.engagement.shares ?? 0
      return acc
    },
    { likes: 0, comments: 0, shares: 0 }
  )

  return (
    <div className="grid gap-4">
      <SocialProfileHeader profile={profile} permalink={null} onRefresh={() => { profilesQuery.refetch(); contentQuery.refetch() }} isRefreshing={profilesQuery.isLoading || contentQuery.isLoading} />

      <Tabs
        variant="underline"
        active={activeTab}
        onChange={setActiveTab}
        items={[
          {
            id: 'overview',
            label: t('socialMedia.profileTabs.overview'),
            content: (
              <div className="grid gap-4">
                <SocialMetricsCards
                  items={[
                    { labelKey: 'socialMedia.profile.followers', value: profile.followers },
                    { labelKey: 'socialMedia.profile.contentCount', value: profile.contentCount },
                    { labelKey: 'socialMedia.overview.recentPosts', value: contentQuery.items.length, icon: <FileText size={13} /> },
                  ]}
                />
                <div>
                  <h3 className="mb-2 text-sm font-bold text-[var(--text)]">{t('socialMedia.overview.recentContent')}</h3>
                  <SocialContentGrid
                    items={contentQuery.items.slice(0, 4)}
                    isLoading={contentQuery.isLoading}
                    error={contentQuery.error}
                    onRetry={contentQuery.refetch}
                    onOpen={setOpenContent}
                    pagination={{ hasNext: false, hasPrevious: false }}
                  />
                </div>
              </div>
            ),
          },
          {
            id: 'content',
            label: t('socialMedia.profileTabs.content'),
            content: (
              <SocialContentGrid
                items={contentQuery.items}
                isLoading={contentQuery.isLoading}
                error={contentQuery.error}
                onRetry={contentQuery.refetch}
                onOpen={setOpenContent}
                pagination={contentQuery.pagination}
                onNext={contentQuery.goNext}
                onPrevious={contentQuery.goPrevious}
              />
            ),
          },
          {
            id: 'engagement',
            label: t('socialMedia.profileTabs.engagement'),
            content: (
              <div className="grid gap-4">
                <SocialMetricsCards
                  items={[
                    { labelKey: 'socialMedia.engagement.likes', value: totals.likes, icon: <Heart size={13} /> },
                    { labelKey: 'socialMedia.engagement.comments', value: totals.comments, icon: <MessageCircle size={13} /> },
                    { labelKey: 'socialMedia.engagement.shares', value: totals.shares, icon: <Share2 size={13} /> },
                    { labelKey: 'socialMedia.engagement.total', value: contentQuery.items.length ? totalEngagement : null },
                  ]}
                />
                {topContent.length > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[var(--text)]">
                      <TrendingUp size={15} />
                      {t('socialMedia.overview.topContent')}
                    </h3>
                    <SocialContentGrid items={topContent} onOpen={setOpenContent} pagination={{ hasNext: false, hasPrevious: false }} />
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      <SocialContentDrawer content={openContent} tenantId={tenantId} open={Boolean(openContent)} onClose={() => setOpenContent(null)} />
    </div>
  )
}
