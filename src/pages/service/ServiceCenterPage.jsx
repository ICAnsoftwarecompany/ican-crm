import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Headset, Map as MapIcon, Plus } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { Button } from '../../shared/components/ui/Button'
import {
  AtRiskCustomers,
  CaseCreateDialog,
  MyWorkList,
  ServiceCenterCounters,
  ServiceMockBanner,
  useServiceCapabilities,
  useServiceTerminology,
} from '../../features/service'

/** /service — daily workspace: counters, my work preview, quick actions. */
export function ServiceCenterPage() {
  const { t } = useTranslation()
  const term = useServiceTerminology()
  const { manifest } = useServiceCapabilities()
  const [createOpen, setCreateOpen] = useState(false)

  usePageHeader({ title: t('service.center.title'), icon: Headset })

  return (
    <div className="grid gap-4 p-4 lg:p-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--text)]">{t('service.center.title')}</h1>
          <p className="text-sm text-[var(--text-muted)]">{t('service.center.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/service/overview"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
          >
            <MapIcon size={16} aria-hidden="true" />
            {t('service.center.setupOverview')}
          </Link>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} aria-hidden="true" />
            {t('service.cases.create.button', { entity: term('case') })}
          </Button>
        </div>
      </header>

      <ServiceMockBanner activeTemplate={manifest.template} />
      <ServiceCenterCounters />

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.center.myWork')}</h2>
          <Link to="/service/my-work" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:underline">
            {t('service.center.viewAll')}
          </Link>
        </div>
        <MyWorkList limit={8} />
      </section>

      <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.health.atRisk')}</h2>
          <Link to="/service/reports?tab=advanced" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:underline">{t('service.center.viewAll')}</Link>
        </div>
        <AtRiskCustomers limit={5} />
      </section>

      <CaseCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

export default ServiceCenterPage
