import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../shared/components/data/ResourceState'
import { useAcknowledgeAlert, useAlerts } from '../hooks/useAlerts'
import { AlertCompactCard } from './AlertCompactCard'
import { AlertsDrawer } from './AlertsDrawer'

export const OPEN_ALERTS_DRAWER_EVENT = 'ican:open-alerts-drawer'

export function AlertsStack() {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const alertsQuery = useAlerts()
  const acknowledge = useAcknowledgeAlert()
  const alerts = alertsQuery.data || []
  const visible = [...alerts.slice(0, 4)].sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt))

  useEffect(() => {
    const open = () => setDrawerOpen(true)
    window.addEventListener(OPEN_ALERTS_DRAWER_EVENT, open)
    return () => window.removeEventListener(OPEN_ALERTS_DRAWER_EVENT, open)
  }, [])

  if (alertsQuery.isLoading || alertsQuery.error || !alerts.length) {
    return alertsQuery.error ? <div className="fixed top-[calc(var(--layout-header-height,48px)+12px)] start-[calc(var(--layout-sidebar-current,240px)+16px)] end-[calc(var(--layout-right-sidebar-offset,0px)+var(--layout-page-drawer-offset,0px)+16px)] z-40"><ResourceState error={alertsQuery.error} onRetry={alertsQuery.refetch} /></div> : null
  }

  return (
    <section
      className="pointer-events-none fixed top-[calc(var(--layout-header-height,48px)+12px)] start-[calc(var(--layout-sidebar-current,240px)+16px)] end-[calc(var(--layout-right-sidebar-offset,0px)+var(--layout-page-drawer-offset,0px)+16px)] z-40 flex flex-col items-center"
      aria-label={t('alerts.title')}
    >
      <div className="alerts-card-stack" style={{ '--alert-count': visible.length }}>
        {visible.map((alert, index) => <AlertCompactCard key={alert.id} alert={alert} index={index} onAcknowledge={acknowledge.mutate} pending={acknowledge.isPending} />)}
      </div>
      {alerts.length > 4 && <button type="button" onClick={() => setDrawerOpen(true)} className="pointer-events-auto mt-2 inline-flex h-7 items-center gap-1.5 rounded-md bg-[var(--surface)] px-2 text-[11px] font-semibold text-[var(--brand-accent)] shadow-sm hover:bg-[var(--brand-accent-soft)]"><AlertTriangle size={13} />{t('alerts.more', { count: alerts.length - 4 })}<ChevronDown size={12} /></button>}
      <AlertsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} alerts={alerts} onAcknowledge={acknowledge.mutate} pending={acknowledge.isPending} title={t('alerts.title')} description={t('alerts.activeCount', { count: alerts.length })} />
    </section>
  )
}
