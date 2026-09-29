export const ALERT_PRIORITY = { critical: 400, danger: 350, high: 300, warning: 200, medium: 150, info: 100, low: 50 }

export function getAlertPriority(severity) {
  return ALERT_PRIORITY[String(severity || '').toLowerCase()] || 75
}

export function sortAlerts(alerts = []) {
  return [...alerts].sort((a, b) => getAlertPriority(b.severity) - getAlertPriority(a.severity) || new Date(b.createdAt) - new Date(a.createdAt))
}
