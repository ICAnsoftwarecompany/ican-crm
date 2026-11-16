import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Siren } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { IncidentDetailView, IncidentsWorkspace } from '../../features/service'

/** /service/incidents/:incidentId? — major incidents. */
export function ServiceIncidentsPage() {
  const { t } = useTranslation()
  const { incidentId } = useParams()
  usePageHeader({ title: t('service.incidents.title'), icon: Siren })
  return <div className="p-4 lg:p-5">{incidentId ? <IncidentDetailView incidentId={incidentId} /> : <IncidentsWorkspace />}</div>
}

export default ServiceIncidentsPage
