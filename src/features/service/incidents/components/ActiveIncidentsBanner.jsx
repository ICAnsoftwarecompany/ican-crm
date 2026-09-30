import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Siren } from 'lucide-react'
import { useIncidents } from '../api/incidentsApi'
import { IncidentSeverity, IncidentStatus } from './IncidentBadges'

/** Operations Center: active major incidents, one line each. `caseId` limits it to the incident a request is linked to. */
export function ActiveIncidentsBanner({ caseId }) {
  const { t } = useTranslation()
  const incidents = useIncidents({ status: 'active' })
  const list = (incidents.data || []).filter((entry) => !caseId || entry.linked_case_ids.includes(caseId))
  if (!list.length) return null
  return (
    <div className="grid gap-2" role="status">
      {list.map((incident) => (
        <Link key={incident.id} to={`/service/incidents/${incident.id}`} className="flex flex-wrap items-center gap-2 rounded-lg border border-sla-breached bg-[var(--surface)] px-4 py-2 text-sm hover:bg-[var(--surface-2)]">
          <Siren size={16} className="text-sla-breached" aria-hidden="true" />
          <span className="font-semibold text-[var(--text)]">{caseId ? t('service.incidents.linkedBanner', { number: incident.number }) : incident.title}</span>
          <IncidentSeverity severity={incident.severity} />
          <IncidentStatus status={incident.status} />
          {!caseId && <span className="text-xs text-[var(--text-muted)]">{t('service.incidents.linkedCount', { count: incident.linked_count, open: incident.open_linked })}</span>}
        </Link>
      ))}
    </div>
  )
}
