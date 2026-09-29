import { getAlertDefinition } from './alertRegistry'
import { sortAlerts } from './alertPriority'

const text = (value) => value === null || value === undefined || typeof value === 'object' ? '' : String(value).trim()
const object = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {}

export function normalizeAlert(value = {}) {
  const raw = object(value)
  const data = object(raw.data)
  const type = text(raw.type || 'unknown')
  const definition = getAlertDefinition(type)
  const normalized = {
    id: text(raw.id), type, title: text(raw.title), message: text(raw.message),
    severity: text(raw.severity || definition.severityFallback).toLowerCase(),
    status: text(raw.status || 'open').toLowerCase(), icon: definition.icon,
    alertableType: text(raw.alertable_type), alertableId: text(raw.alertable_id),
    entityType: text(raw.alertable_type).split('\\').pop().toLowerCase(),
    entityId: text(raw.alertable_id || data.lead_id), assignedUserId: text(raw.assigned_user_id),
    createdAt: raw.created_at || new Date().toISOString(), updatedAt: raw.updated_at || null,
    resolvedAt: raw.resolved_at || null, resolvedBy: raw.resolved_by || null, data, raw,
  }
  return { ...normalized, target: definition.resolveTarget(normalized), actionKey: normalized.entityType === 'lead' ? 'alerts.actions.openLead' : 'alerts.actions.openEntity' }
}

export function normalizeAlertList(response) {
  const candidates = [response?.data?.data, response?.data, response?.alerts, response]
  const list = candidates.find(Array.isArray) || []
  const unique = new Map()
  list.forEach((item) => { const alert = normalizeAlert(item); if (alert.id && alert.status === 'open') unique.set(alert.id, alert) })
  return sortAlerts([...unique.values()])
}
