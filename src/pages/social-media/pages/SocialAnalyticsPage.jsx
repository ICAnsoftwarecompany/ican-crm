import { useTranslation } from 'react-i18next'
import { Heart, MessageCircle, Share2, FileText, Info } from 'lucide-react'
import { PageToolbar } from '../../../shared/components/data/PageToolbar'
import { useAuthStore } from '../../../store/authStore'
import { resolveTenantId } from '../../../services/tenantResolver'
import { useSocialProfiles, useSocialContent, SocialMetricsCards, SocialContentEmptyState, calculateTotalEngagement } from '../../../features/social-media'

/**
 * Only aggregates computed from the currently-loaded posts (likes/
 * comments/shares sums) — see docs "Analytics". Deliberately never shows
 * Reach/Impressions/CTR/Engagement Rate/Followers Growth/Video Watch Time:
 * no API here provides them. The scope note is not decorative — it's the
 * thing that keeps this honest.
 */
export function SocialAnalyticsPage() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const tenantId = resolveTenantId(user)

  const profilesQuery = useSocialProfiles({ tenantId })
  const primaryProfile = profilesQuery.data[0] || null

  const contentQuery = useSocialContent({
    tenantId,
    platform: primaryProfile?.platform,
    profileId: primaryProfile?.externalId,
    enabled: Boolean(primaryProfile),
  })

  const totals = contentQuery.items.reduce(
    (acc, item) => {
      acc.likes += item.engagement.likes ?? 0
      acc.comments += item.engagement.comments ?? 0
      acc.shares += item.engagement.shares ?? 0
      return acc
    },
    { likes: 0, comments: 0, shares: 0 }
  )
  const totalEngagement = contentQuery.items.reduce((sum, item) => {
    const value = calculateTotalEngagement(item.engagement)
    return value === null ? sum : sum + value
  }, 0)

  return (
    <div className="grid gap-4">
      <PageToolbar title={t('socialMedia.analytics.title')} description={t('socialMedia.analytics.description')} />

      {!primaryProfile ? (
        <SocialContentEmptyState variant="noIntegration" />
      ) : (
        <>
          <div className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--text-muted)]">
            <Info size={14} className="mt-0.5 shrink-0" />
            {t('socialMedia.analytics.scopeNote', { count: contentQuery.items.length, profile: primaryProfile.name })}
          </div>

          <SocialMetricsCards
            items={[
              { labelKey: 'socialMedia.overview.recentPosts', value: contentQuery.items.length, icon: <FileText size={13} /> },
              { labelKey: 'socialMedia.engagement.likes', value: totals.likes, icon: <Heart size={13} /> },
              { labelKey: 'socialMedia.engagement.comments', value: totals.comments, icon: <MessageCircle size={13} /> },
              { labelKey: 'socialMedia.engagement.shares', value: totals.shares, icon: <Share2 size={13} /> },
              { labelKey: 'socialMedia.engagement.total', value: contentQuery.items.length ? totalEngagement : null },
            ]}
          />
        </>
      )}
    </div>
  )
}
