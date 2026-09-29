import { AlertTriangle, ClockAlert } from 'lucide-react'

const leadTarget = (alert) => {
  const id = alert.data?.lead_id || alert.alertableId
  return id ? `/lead/${id}` : ''
}

export const alertRegistry = {
  classification_sla_breached: { icon: AlertTriangle, severityFallback: 'critical', resolveTarget: leadTarget },
  stale_lead: { icon: ClockAlert, severityFallback: 'warning', resolveTarget: leadTarget },
}

export const fallbackAlertDefinition = { icon: AlertTriangle, severityFallback: 'info', resolveTarget: () => '' }

export function getAlertDefinition(type) {
  return alertRegistry[String(type || '').toLowerCase()] || fallbackAlertDefinition
}
