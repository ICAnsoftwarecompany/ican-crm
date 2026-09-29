import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { AlertBanner } from './AlertBanner'
import { AlertsSummary } from './AlertsSummary'

export function AlertsDrawer({ open, onClose, alerts, onAcknowledge, pending, title, description }) {
  return (
    <AppDrawer open={open} onClose={onClose} title={title} description={description} size="lg" portal pushPage={false} drawerKey="operational-alerts">
      <div className="space-y-4">
        <AlertsSummary alerts={alerts} />
        <div className="space-y-2">{alerts.map((alert) => <AlertBanner key={alert.id} alert={alert} onAcknowledge={onAcknowledge} pending={pending} onNavigate={onClose} />)}</div>
      </div>
    </AppDrawer>
  )
}
