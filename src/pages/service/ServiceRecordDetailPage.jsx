import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Layers3 } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { RecordDetailView } from '../../features/service'

/** /service/records/:recordType/:recordId */
export function ServiceRecordDetailPage() {
  const { t } = useTranslation()
  const { recordType, recordId } = useParams()
  usePageHeader({ title: t('service.hub.title'), icon: Layers3 })
  return <RecordDetailView recordId={recordId} backTo={`/service/records/${recordType}`} />
}

export default ServiceRecordDetailPage
