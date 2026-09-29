import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { Select } from '../../../../shared/components/ui/Select'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useBatch, useBatchMutations, useRecordList, useRecordsSetup } from '../hooks/useRecords'
import { findRecordType } from '../utils/recordType'
import { RecordsTable } from './RecordsTable'

/**
 * One batch: its records + bulk status. The server applies the transition per
 * record and reports the ones it could not move (their pipeline disallowed it).
 */
export function BatchDetailView({ batchId, backTo, recordPath }) {
  const { t, i18n } = useTranslation()
  const batch = useBatch(batchId)
  const setup = useRecordsSetup()
  const records = useRecordList({ batch_id: batchId, view: 'all' })
  const { bulkStatus } = useBatchMutations()
  const [target, setTarget] = useState('')
  const recordType = findRecordType(setup.data, batch.data?.record_type?.id)
  const statuses = recordType?.pipeline?.statuses || []
  const language = i18n.language

  const apply = () =>
    bulkStatus.mutate(
      { id: batchId, to_status_id: target },
      {
        onSuccess: (result) => {
          toast.success(t('service.records.batches.bulkDone', { updated: result.updated.length, skipped: result.skipped.length }))
          setTarget('')
        },
      }
    )

  return (
    <div className="grid gap-4">
      <Link to={backTo} className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />
        {t('service.records.batches.back')}
      </Link>
      <ResourceState isLoading={batch.isLoading || setup.isLoading} error={batch.error || setup.error} onRetry={batch.refetch}>
        {batch.data && (
          <>
            <header className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)]" dir="ltr">{batch.data.reference_no}</p>
                <h1 className="text-lg font-bold text-[var(--text)]">{localizeLabel(batch.data.name, language, batch.data.reference_no)}</h1>
                <p className="text-xs text-[var(--text-muted)]">{t('service.records.batches.recordsCount', { count: batch.data.records_count })}</p>
              </div>
              <div className="flex items-end gap-2">
                <div className="w-56">
                  <Select label={t('service.records.batches.bulkLabel')} placeholder={t('service.records.batches.pickStatus')} value={target} onChange={setTarget} options={statuses.map((status) => ({ value: status.id, label: localizeLabel(status.label, language, status.key) }))} />
                </div>
                <Button disabled={!target} loading={bulkStatus.isPending} onClick={apply}>{t('service.records.batches.apply')}</Button>
              </div>
            </header>
            <RecordsTable query={records} recordType={recordType} detailPath={recordPath} emptyMessage={t('service.records.batches.noRecords')} />
          </>
        )}
      </ResourceState>
    </div>
  )
}
