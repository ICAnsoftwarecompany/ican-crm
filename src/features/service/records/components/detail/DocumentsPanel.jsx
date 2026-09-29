import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, FileUp, X } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { FormDialog } from '../../../../../shared/components/overlays/FormDialog'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { cn } from '../../../../../shared/utils/cn'
import { useRecordMutations, useRecordSection } from '../../hooks/useRecords'

const TONE = { missing: 'text-sla-at-risk', uploaded: 'text-status-contacted', verified: 'text-sla-on-track', rejected: 'text-sla-breached' }

/**
 * Required documents per participant (spec §13.2). Files go through the shared
 * file system on the server; the mock only records the file name.
 */
export function DocumentsPanel({ record, participants = [] }) {
  const { t } = useTranslation()
  const documents = useRecordSection(record.id, 'documents')
  const { documentAction } = useRecordMutations(record.id)
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')
  const list = documents.data || []
  const groups = [...new Set(list.map((doc) => doc.participant_id || 'record'))]
  const nameOf = (id) => participants.find((participant) => participant.id === id)?.name || t('service.records.documents.recordLevel')

  const upload = (doc) => (event) => {
    const file = event.target.files?.[0]
    if (file) documentAction.mutate({ docId: doc.id, action: 'upload', file_name: file.name })
    event.target.value = ''
  }

  return (
    <ResourceState isLoading={documents.isLoading} error={documents.error} onRetry={documents.refetch} empty={!list.length} emptyTitle={t('service.records.documents.empty')}>
      <div className="grid gap-3">
        {groups.map((group) => (
          <section key={group} className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text)]">{nameOf(group)}</h3>
            <ul className="divide-y divide-[var(--border)]">
              {list.filter((doc) => (doc.participant_id || 'record') === group).map((doc) => (
                <li key={doc.id} className="flex flex-wrap items-center gap-3 py-2">
                  <span className="w-36 text-sm text-[var(--text)]">{t(`service.capabilities.options.${doc.document_type}`, { defaultValue: doc.document_type })}</span>
                  <span className={cn('text-xs font-medium', TONE[doc.status])}>{t(`service.records.documents.statuses.${doc.status}`)}</span>
                  {doc.file_name && <span className="text-xs text-[var(--text-muted)]" dir="ltr">{doc.file_name}</span>}
                  {doc.rejection_reason && <span className="text-xs text-[var(--text-muted)]">{doc.rejection_reason}</span>}
                  <span className="ms-auto flex items-center gap-1">
                    <label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-xs text-[var(--text)] hover:bg-[var(--surface-2)]">
                      <FileUp size={14} aria-hidden="true" />
                      {t('service.records.documents.upload')}
                      <input type="file" className="sr-only" onChange={upload(doc)} />
                    </label>
                    <Button variant="ghost" size="sm" disabled={doc.status !== 'uploaded'} onClick={() => documentAction.mutate({ docId: doc.id, action: 'verify' })}>
                      <Check size={14} aria-hidden="true" />
                      {t('service.records.documents.verify')}
                    </Button>
                    <Button variant="ghost" size="sm" disabled={doc.status === 'missing'} onClick={() => setRejecting(doc)}>
                      <X size={14} aria-hidden="true" />
                      {t('service.records.documents.reject')}
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <FormDialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title={t('service.records.documents.rejectTitle')}
        submitText={t('service.records.documents.reject')}
        loading={documentAction.isPending}
        submitDisabled={!reason.trim()}
        onSubmit={() => documentAction.mutate({ docId: rejecting.id, action: 'reject', reason }, { onSuccess: () => { setRejecting(null); setReason('') } })}
      >
        <Input label={t('service.records.documents.reason')} dir="auto" value={reason} onChange={(event) => setReason(event.target.value)} />
      </FormDialog>
    </ResourceState>
  )
}
