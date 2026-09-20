import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, List, CalendarDays } from 'lucide-react'
import { PageToolbar } from '../../../shared/components/data/PageToolbar'
import { useAuthStore } from '../../../store/authStore'
import { resolveTenantId } from '../../../services/tenantResolver'
import { Select } from '../../../shared/components/ui/Select'
import {
  useSocialProfiles,
  useSocialContent,
  SocialContentGrid,
  SocialContentList,
  SocialContentCalendar,
  SocialContentFilters,
  SocialContentDrawer,
  SocialContentEmptyState,
} from '../../../features/social-media'

const VIEWS = [
  { id: 'grid', icon: LayoutGrid },
  { id: 'list', icon: List },
  { id: 'calendar', icon: CalendarDays },
]

/**
 * Unified content library — see docs "Content Page". Today only Facebook
 * has a real content source, so a profile must be selected before content
 * loads (the same constraint `useSocialContent` itself has); once another
 * platform's adapter exists, this page needs no structural change — see
 * docs "كيفية إضافة Platform جديدة".
 */
export function SocialContentPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const tenantId = resolveTenantId(user)

  const [view, setView] = useState('grid')
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [filters, setFilters] = useState({ search: '', contentType: '' })
  const [openContent, setOpenContent] = useState(null)

  const profilesQuery = useSocialProfiles({ tenantId })
  const activeProfile = profilesQuery.data.find((profile) => profile.id === selectedProfileId) || profilesQuery.data[0] || null

  const contentQuery = useSocialContent({
    tenantId,
    platform: activeProfile?.platform,
    profileId: activeProfile?.externalId,
    enabled: Boolean(activeProfile),
  })

  const filteredItems = useMemo(() => {
    return contentQuery.items.filter((content) => {
      if (filters.contentType && content.mediaType !== filters.contentType) return false
      if (filters.search && !String(content.message || '').toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.dateFrom && content.publishedAt && new Date(content.publishedAt) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && content.publishedAt && new Date(content.publishedAt) > new Date(filters.dateTo)) return false
      return true
    })
  }, [contentQuery.items, filters])

  const hasActiveFilters = Boolean(filters.search || filters.contentType || filters.dateFrom || filters.dateTo)
  const emptyVariant = profilesQuery.data.length === 0 ? 'noIntegration' : hasActiveFilters && contentQuery.items.length > 0 ? 'noFilterResults' : 'noContent'

  return (
    <div className="grid gap-4">
      <PageToolbar title={t('socialMedia.content.title')} description={t('socialMedia.content.description')} />

      {profilesQuery.data.length === 0 ? (
        <SocialContentEmptyState variant="noIntegration" />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-64">
              <Select
                label={t('socialMedia.filters.profile')}
                value={activeProfile?.id || ''}
                onChange={setSelectedProfileId}
                options={profilesQuery.data.map((profile) => ({ value: profile.id, label: profile.name }))}
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
              {VIEWS.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView(id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${view === id ? 'bg-[#00C2CB] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'}`}
                  aria-label={t(`socialMedia.content.views.${id}`)}
                  title={t(`socialMedia.content.views.${id}`)}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          <SocialContentFilters filters={filters} onChange={setFilters} showPlatform={false} showProfile={false} />

          {view === 'grid' && (
            <SocialContentGrid
              items={filteredItems}
              isLoading={contentQuery.isLoading}
              error={contentQuery.error}
              onRetry={contentQuery.refetch}
              onOpen={setOpenContent}
              pagination={contentQuery.pagination}
              onNext={contentQuery.goNext}
              onPrevious={contentQuery.goPrevious}
              emptyVariant={emptyVariant}
            />
          )}

          {view === 'list' && (
            <SocialContentList items={filteredItems} isLoading={contentQuery.isLoading} error={contentQuery.error} onRetry={contentQuery.refetch} onOpen={setOpenContent} />
          )}

          {view === 'calendar' && (
            <SocialContentCalendar items={filteredItems} isLoading={contentQuery.isLoading} error={contentQuery.error} onRetry={contentQuery.refetch} onOpen={setOpenContent} />
          )}
        </>
      )}

      <SocialContentDrawer content={openContent} tenantId={tenantId} open={Boolean(openContent)} onClose={() => setOpenContent(null)} />
    </div>
  )
}
