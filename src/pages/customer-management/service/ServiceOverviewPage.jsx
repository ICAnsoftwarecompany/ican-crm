import { useTranslation } from 'react-i18next'
import { Headset } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { ResourceState } from '../../shared/components/data/ResourceState'
import {
  CapabilitiesOverview,
  ServiceMockBanner,
  ServiceRoadmap,
  useServiceCapabilities,
} from '../../features/service'

/**
 * /service — Service Operations overview (F0).
 * Composes the capabilities manifest, the mock-template switcher and the
 * phase roadmap. Becomes the Service Center workspace entry point in F1.
 */
export function ServiceOverviewPage() {
  const { t } = useTranslation()
  const { manifest, isLoading, error, refetch } = useServiceCapabilities()

  usePageHeader({ title: t('service.title'), icon: Headset })

  return (
    <div className="grid gap-4 p-4 lg:p-5">
      <header>
        <h1 className="text-lg font-bold text-[var(--text)]">{t('service.overview.title')}</h1>
        <p className="text-sm text-[var(--text-muted)]">{t('service.overview.subtitle')}</p>
      </header>

      <ServiceMockBanner activeTemplate={manifest.template} />

      <ResourceState isLoading={isLoading} error={error} onRetry={refetch}>
        <CapabilitiesOverview manifest={manifest} />
      </ResourceState>

      <ServiceRoadmap />
    </div>
  )
}

export default ServiceOverviewPage
