import { ACTIVITY_EMPTY_LABEL } from '../constants/activityConstants'
import { formatDuration } from './activityDateHelpers'

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

export function activityText(value, fallback = '') {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)

  if (Array.isArray(value)) {
    const firstText = value
      .map((item) => activityText(item, ''))
      .find((item) => item)
    return firstText || fallback
  }

  if (typeof value === 'object') {
    const text = firstValue(
      value.note,
      value.description,
      value.summary,
      value.body,
      value.text,
      value.title,
      value.name
    )

    if (text !== undefined && text !== null && text !== '') return activityText(text, fallback)
    return fallback
  }

  return fallback
}

function normalizeUser(user, fallbackId) {
  if (!user && !fallbackId) return null
  if (typeof user === 'string') return { name: user }
  if (typeof user === 'number') return { id: user, name: `#${user}` }

  return {
    id: firstValue(user?.id, fallbackId),
    name: firstValue(user?.name, user?.full_name, user?.email, fallbackId ? `#${fallbackId}` : ''),
    email: user?.email,
    phone: user?.phone,
    raw: user,
  }
}

function normalizeTeam(team, fallbackId) {
  if (!team && !fallbackId) return null
  if (typeof team === 'string') return { name: team }

  return {
    id: firstValue(team?.id, fallbackId),
    name: firstValue(team?.name, team?.title, fallbackId ? `#${fallbackId}` : ''),
    raw: team,
  }
}

function normalizeRelatedEntity(item = {}) {
  const lead = firstValue(item.lead, item.customer?.lead, item.taskable_type?.includes?.('Lead') ? item.taskable : null)
  const customer = firstValue(item.customer, item.client, item.taskable_type?.includes?.('Customer') ? item.taskable : null)
  const entity = lead || customer || item.taskable || null
  const type = lead ? 'lead' : customer ? 'customer' : String(item.taskable_type || '').toLowerCase().includes('customer') ? 'customer' : 'lead'
  const id = firstValue(entity?.id, item.lead_id, item.customer_id, item.taskable_id)

  return {
    id,
    type,
    name: firstValue(entity?.name, entity?.title, entity?.email, entity?.phone, item.lead_name, item.customer_name, id ? `#${id}` : ACTIVITY_EMPTY_LABEL),
    company: firstValue(entity?.company, entity?.company_name, item.company, item.company_name),
    phone: firstValue(entity?.phone, entity?.mobile, item.phone, item.callee_number),
    email: firstValue(entity?.email, item.email),
    status: firstValue(entity?.status?.title, entity?.status_name, entity?.status),
    source: firstValue(entity?.source?.name, entity?.source_name, entity?.source),
    raw: entity,
  }
}

function latestReport(item = {}) {
  const reports = firstValue(item.reports, item.meeting_reports, item.activity_reports, [])
  if (!Array.isArray(reports) || !reports.length) return null

  return [...reports].sort((left, right) => {
    const rightDate = new Date(right.created_at || right.updated_at || 0).getTime()
    const leftDate = new Date(left.created_at || left.updated_at || 0).getTime()
    return rightDate - leftDate
  })[0]
}

export function normalizeActivity(item = {}) {
  const type = firstValue(item.type, item.activity_type, item.kind, 'meeting')
  const report = latestReport(item)
  const startAt = firstValue(item.start_at, item.startAt, item.scheduled_at, item.activity_at, item.date)
  const endAt = firstValue(item.end_at, item.endAt, item.finished_at)
  const relatedEntity = normalizeRelatedEntity(item)
  const assignedUser = normalizeUser(firstValue(item.assigned_user, item.assignedTo, item.user, item.owner), firstValue(item.assigned_to, item.user_id))
  const assignedTeam = normalizeTeam(firstValue(item.assigned_team, item.team), item.team_id)
  const participants = firstValue(item.participants, item.users, item.attendees, [])
  const notes = firstValue(item.notes, item.activity_notes, [])
  const files = firstValue(item.attachments, item.files, item.media, [])
  const status = firstValue(item.status, item.state, 'scheduled')
  const reminderType = firstValue(item.reminder_type, item.reminderType, '')
  const reminderBefore = firstValue(item.reminder_before, item.reminderBefore, '')
  const reminderUnit = firstValue(item.reminder_unit, item.reminderUnit, '')
  const actualStartAt = firstValue(item.actual_start_at, item.actualStartAt, '')

  return {
    id: item.id,
    type,
    // Data-normalization default (runs outside React/i18n context via the API layer);
    // kept as an Arabic literal on purpose — see docs/TRANSLATION_MIGRATION_AUDIT.md.
    title: firstValue(item.title, item.name, type === 'call' ? 'مكالمة بدون عنوان' : 'اجتماع بدون عنوان'),
    description: activityText(firstValue(item.description, item.note, item.notes, ''), ''),
    status,
    priority: firstValue(item.priority, 'medium'),
    startAt,
    endAt,
    duration: item.duration || formatDuration(startAt, endAt),
    mode: firstValue(item.mode, item.meeting_mode),
    location: item.location,
    meetingUrl: firstValue(item.meeting_url, item.meeting_link, item.url),
    phone: firstValue(item.phone, item.phone_number, item.callee_number, item.caller_number, relatedEntity.phone),
    callProvider: item.call_provider,
    reminderType,
    reminderBefore,
    reminderUnit,
    actualStartAt,
    relatedEntity,
    assignedUser,
    assignedTeam,
    participants: Array.isArray(participants) ? participants : [],
    notes: Array.isArray(notes) ? notes : [],
    files: Array.isArray(files) ? files : [],
    report,
    hasReport: Boolean(report || item.has_report),
    outcome: firstValue(item.outcome, report?.outcome),
    nextAction: firstValue(item.next_action, report?.next_action),
    createdBy: normalizeUser(firstValue(item.created_by, item.creator), item.created_by_id),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    raw: item,
  }
}

export function getActivityLabel(activity, t) {
  if (!t) return activity?.type === 'call' ? 'المكالمة' : 'الاجتماع'
  return activity?.type === 'call' ? t('activities.page.callLabel') : t('activities.page.meetingLabel')
}
