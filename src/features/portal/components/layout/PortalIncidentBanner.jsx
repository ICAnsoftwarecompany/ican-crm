import { useTranslation } from 'react-i18next'
import { Siren } from 'lucide-react'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { usePortalList } from '../../api/portalApi'

/** Public updates of active major incidents (F6), so customers know before they write to us. */
export function PortalIncidentBanner() {
  const { t } = useTranslation()
  const incidents = usePortalList('incidents', P.incidents, undefined, { staleTime: 60 * 1000 })
  const list = Array.isArray(incidents.data) ? incidents.data : []
  if (!list.length) return null
  return (
    <div className="grid gap-2" role="status">
      {list.map((incident) => (
        <div key={incident.id} className="flex items-start gap-2 rounded-xl border border-sla-at-risk bg-[var(--surface)] px-4 py-3 text-sm">
          <Siren size={18} className="mt-0.5 shrink-0 text-sla-at-risk" aria-hidden="true" />
          <span className="grid gap-0.5">
            <span className="font-semibold"><bdi>{incident.title}</bdi> · {t(`portal.incidents.statuses.${incident.status}`)}</span>
            <span dir="auto" className="text-[var(--text-muted)]">{incident.update?.message}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
