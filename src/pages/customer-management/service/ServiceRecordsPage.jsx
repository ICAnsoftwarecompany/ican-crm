import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Layers3 } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { EmptyState } from '../../shared/components/feedback/EmptyState'
import { RecordsWorkspace, findRecordType, useRecordsSetup } from '../../features/service'

/** /service/records/:recordType? — records of one type (first type when omitted). */
export function ServiceRecordsPage() {
  const { t } = useTranslation()
  const { recordType } = useParams()
  const setup = useRecordsSetup()
  usePageHeader({ title: t('service.hub.title'), icon: Layers3 })
  const type = findRecordType(setup.data, recordType)
  const first = setup.data?.record_types?.[0]

  if (!recordType && first) return <Navigate to={`/service/records/${first.key}`} replace />
  return (
    <ResourceState isLoading={setup.isLoading} error={setup.error} onRetry={setup.refetch}>
      {type ? (
        <RecordsWorkspace key={type.key} recordType={type} detailPath={(record) => `/service/records/${type.key}/${record.id}`} />
      ) : (
        <EmptyState icon={<Layers3 size={24} />} title={t('service.records.noTypes')} description={t('service.records.noTypesHint')} />
      )}
    </ResourceState>
  )
}

export default ServiceRecordsPage
