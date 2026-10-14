import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { RefreshCcw } from 'lucide-react'
import { PageToolbar } from '../../../shared/components/data/PageToolbar'
import { Button } from '../../../shared/components/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import { resolveTenantId } from '../../../services/tenantResolver'
import { useSocialProfiles, SocialProfileCard, SocialContentEmptyState, getSocialPlatforms } from '../../../features/social-media'

export function SocialProfilesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const tenantId = resolveTenantId(user)
  const [platformFilter, setPlatformFilter] = useState('all')

  const profilesQuery = useSocialProfiles({ tenantId })
  const platforms = getSocialPlatforms()

  const filtered = useMemo(
    () => (platformFilter === 'all' ? profilesQuery.data : profilesQuery.data.filter((profile) => profile.platform === platformFilter)),
    [profilesQuery.data, platformFilter]
  )

  return (
    <div className="grid gap-4">
      <PageToolbar title={t('socialMedia.profiles.title')} description={t('socialMedia.profiles.description')}>
        <Button variant="outline" onClick={() => profilesQuery.refetch()} loading={profilesQuery.isLoading}>
          <RefreshCcw size={15} />
          {t('socialMedia.overview.sync')}
        </Button>
      </PageToolbar>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPlatformFilter('all')}
          className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${platformFilter === 'all' ? 'border-[#00C2CB] bg-[#00C2CB] text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'}`}
        >
          {t('socialMedia.profiles.allPlatforms')}
        </button>
        {platforms.map((platform) => (
          <button
            key={platform.id}
            type="button"
            onClick={() => setPlatformFilter(platform.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${platformFilter === platform.id ? 'border-[#00C2CB] bg-[#00C2CB] text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'}`}
          >
            {t(platform.labelKey)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <SocialContentEmptyState variant="noIntegration" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((profile) => (
            <SocialProfileCard key={profile.id} profile={profile} onOpen={(p) => navigate(`/social-media/${p.platform}/${p.externalId}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
