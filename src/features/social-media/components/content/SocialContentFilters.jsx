import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { getSocialPlatforms } from '../../config/socialPlatformsRegistry'

const CONTENT_TYPES = ['text', 'image', 'video', 'carousel', 'link', 'unknown']

/**
 * `filters` / `onChange` is a plain controlled object
 * `{ platform, profileId, contentType, dateFrom, dateTo, search }` — the
 * caller decides which fields are relevant (e.g. the Facebook profile page
 * omits the Platform/Profile filters since both are already fixed by the
 * route). See docs "Filters": content type is whatever the adapter derived,
 * never a raw Facebook-only assumption baked into this component.
 */
export function SocialContentFilters({ filters, onChange, profiles = [], showPlatform = true, showProfile = true }) {
  const { t } = useTranslation()

  const update = (patch) => onChange?.({ ...filters, ...patch })

  const platformOptions = getSocialPlatforms().map((platform) => ({ value: platform.id, label: t(platform.labelKey) }))
  const profileOptions = profiles.map((profile) => ({ value: profile.id, label: profile.name }))
  const contentTypeOptions = CONTENT_TYPES.map((type) => ({ value: type, label: t(`socialMedia.mediaType.${type}`) }))

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-56 flex-1">
        <Input
          startIcon={<Search size={14} />}
          label={t('socialMedia.filters.search')}
          placeholder={t('socialMedia.filters.searchPlaceholder')}
          value={filters.search || ''}
          onChange={(event) => update({ search: event.target.value })}
        />
      </div>

      {showPlatform && (
        <div className="w-44">
          <Select label={t('socialMedia.filters.platform')} value={filters.platform || ''} onChange={(value) => update({ platform: value })} options={platformOptions} />
        </div>
      )}

      {showProfile && profileOptions.length > 0 && (
        <div className="w-52">
          <Select label={t('socialMedia.filters.profile')} value={filters.profileId || ''} onChange={(value) => update({ profileId: value })} options={profileOptions} />
        </div>
      )}

      <div className="w-44">
        <Select label={t('socialMedia.filters.contentType')} value={filters.contentType || ''} onChange={(value) => update({ contentType: value })} options={contentTypeOptions} />
      </div>

      <div className="w-40">
        <Input type="date" label={t('socialMedia.filters.dateFrom')} value={filters.dateFrom || ''} onChange={(event) => update({ dateFrom: event.target.value })} />
      </div>
      <div className="w-40">
        <Input type="date" label={t('socialMedia.filters.dateTo')} value={filters.dateTo || ''} onChange={(event) => update({ dateTo: event.target.value })} />
      </div>
    </div>
  )
}
