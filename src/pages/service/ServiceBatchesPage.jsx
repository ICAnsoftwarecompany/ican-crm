import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Layers } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { EmptyState } from '../../shared/components/feedback/EmptyState'
import { BatchDetailView, BatchesWorkspace, findRecordType, useRecordsSetup } from '../../features/service'

/** /service/batches/:recordType?/:batchId? — batches of a record type, or one batch. */
export function ServiceBatchesPage() {
  const { t } = useTranslation()
  const { recordType, batchId } = useParams()
  const setup = useRecordsSetup()
  usePageHeader({ title: t('service.hub.title'), icon: Layers })
  const withBatches = (setup.data?.record_types || []).filter((type) => type.batch_enabled)
  const type = findRecordType(setup.data, recordType)

  if (!recordType && withBatches[0]) return <Navigate to={`/service/batches/${withBatches[0].key}`} replace />
  return (
    <ResourceState isLoading={setup.isLoading} error={setup.error} onRetry={setup.refetch}>
      {!type?.batch_enabled ? (
        <EmptyState icon={<Layers size={24} />} title={t('service.records.batches.disabled')} />
      ) : batchId ? (
        <BatchDetailView batchId={batchId} backTo={`/service/batches/${type.key}`} recordPath={(record) => `/service/records/${type.key}/${record.id}`} />
      ) : (
        <BatchesWorkspace key={type.key} recordType={type} detailPath={(batch) => `/service/batches/${type.key}/${batch.id}`} />
      )}
    </ResourceState>
  )
}

export default ServiceBatchesPage
