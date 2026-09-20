import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { RefreshCcw } from 'lucide-react'
import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { Button } from '../../../../shared/components/ui/Button'
import { useAuthStore } from '../../../../store/authStore'
import { resolveTenantId } from '../../../../services/tenantResolver'
import { useSocialProfiles, SocialProfileCard, SocialContentEmptyState } from '../../../../features/social-media'

/** All connected Facebook Pages — the user picks one to open its full details. See docs "Facebook Platform Page". */
export function FacebookPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const tenantId = resolveTenantId(user)

  const profilesQuery = useSocialProfiles({ tenantId, platform: 'facebook' })

  return (
    <div className="grid gap-4">
      <PageToolbar title={t('socialMedia.platforms.facebook')} description={t('socialMedia.facebookPages.description')}>
        <Button variant="outline" onClick={() => profilesQuery.refetch()} loading={profilesQuery.isLoading}>
          <RefreshCcw size={15} />
          {t('socialMedia.overview.sync')}
        </Button>
      </PageToolbar>

      {profilesQuery.data.length === 0 ? (
        <SocialContentEmptyState variant="noPages" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {profilesQuery.data.map((profile) => (
            <SocialProfileCard key={profile.id} profile={profile} onOpen={(p) => navigate(`/social-media/facebook/${p.externalId}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
