import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { RefreshCcw, Users, FileText, Heart, TrendingUp } from 'lucide-react'
import { PageToolbar } from '../../../shared/components/data/PageToolbar'
import { Button } from '../../../shared/components/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import { resolveTenantId } from '../../../services/tenantResolver'
import {
  useSocialProfiles,
  useSocialContent,
  SocialProfileCard,
  SocialContentGrid,
  SocialContentDrawer,
  SocialMetricsCards,
  calculateTotalEngagement,
  rankContentByEngagement,
} from '../../../features/social-media'

/**
 * Cross-platform dashboard — never Facebook-specific in its own copy/
 * structure (see docs "Social Media Overview"). "Recent Content"/"Top
 * Content"/"Content Summary" scope to the first connected profile with
 * real content today (Facebook) rather than faking a cross-platform
 * aggregate the API can't actually produce without an N+1 fan-out.
 */
export function SocialOverviewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const tenantId = resolveTenantId(user)
  const [openContent, setOpenContent] = useState(null)

  const profilesQuery = useSocialProfiles({ tenantId })
  const primaryProfile = profilesQuery.data[0] || null

  const contentQuery = useSocialContent({
    tenantId,
    platform: primaryProfile?.platform,
    profileId: primaryProfile?.externalId,
    enabled: Boolean(primaryProfile),
  })

  const topContent = rankContentByEngagement(contentQuery.items, 4)
  const totalEngagement = contentQuery.items.reduce((sum, item) => {
    const value = calculateTotalEngagement(item.engagement)
    return value === null ? sum : sum + value
  }, 0)

  return (
    <div className="grid gap-5">
      <PageToolbar title={t('socialMedia.overview.title')} description={t('socialMedia.overview.description')}>
        <Button variant="outline" onClick={() => profilesQuery.refetch()} loading={profilesQuery.isLoading}>
          <RefreshCcw size={15} />
          {t('socialMedia.overview.sync')}
        </Button>
        <Button onClick={() => navigate('/social-media/profiles')}>
          <Users size={15} />
          {t('socialMedia.overview.manageProfiles')}
        </Button>
      </PageToolbar>

      <section>
        <h2 className="mb-3 text-sm font-bold text-[var(--text)]">{t('socialMedia.overview.connectedProfiles')}</h2>
        {profilesQuery.data.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">
            {t('socialMedia.emptyStates.noIntegration.description')}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {profilesQuery.data.map((profile) => (
              <SocialProfileCard key={profile.id} profile={profile} onOpen={(p) => navigate(`/social-media/${p.platform}/${p.externalId}`)} />
            ))}
          </div>
        )}
      </section>

      {primaryProfile && (
        <>
          <section>
            <h2 className="mb-3 text-sm font-bold text-[var(--text)]">{t('socialMedia.overview.contentSummary')}</h2>
            <SocialMetricsCards
              items={[
                { labelKey: 'socialMedia.overview.recentPosts', value: contentQuery.items.length, icon: <FileText size={13} /> },
                { labelKey: 'socialMedia.overview.totalEngagement', value: contentQuery.items.length ? totalEngagement : null, icon: <Heart size={13} /> },
              ]}
            />
          </section>

          {topContent.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-[var(--text)]">
                <TrendingUp size={15} />
                {t('socialMedia.overview.topContent')}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {topContent.map((content) => (
                  <button key={content.id} type="button" onClick={() => setOpenContent(content)} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-start hover:bg-[var(--surface-2)]">
                    <p className="line-clamp-2 text-xs text-[var(--text-muted)]">{content.message || t('socialMedia.content.untitled')}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-bold text-[var(--text)]">{t('socialMedia.overview.recentContent')}</h2>
            <SocialContentGrid
              items={contentQuery.items.slice(0, 8)}
              isLoading={contentQuery.isLoading}
              error={contentQuery.error}
              onRetry={contentQuery.refetch}
              onOpen={setOpenContent}
              pagination={{ hasNext: false, hasPrevious: false }}
              emptyVariant="noContent"
            />
          </section>
        </>
      )}

      <SocialContentDrawer content={openContent} tenantId={tenantId} open={Boolean(openContent)} onClose={() => setOpenContent(null)} />
    </div>
  )
}
