import { useTranslation } from 'react-i18next'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { usePortalList } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { Card, PortalPage, StatusPill } from '../PortalPage'
import { DocumentUploadButton } from '../records/PortalRecordDetail'

const TONE = { missing: 'bad', uploaded: 'warn', verified: 'ok', rejected: 'bad' }

/** Required documents across the customer's records: upload what is missing, see what was rejected and why. */
export function PortalDocuments() {
  const { t } = useTranslation()
  const { can } = usePortalAccess()
  const query = usePortalList('documents', P.documents)
  const docs = [...(query.data || [])].sort((a, b) => ['missing', 'rejected', 'uploaded', 'verified'].indexOf(a.status) - ['missing', 'rejected', 'uploaded', 'verified'].indexOf(b.status))
  return (
    <PortalPage title={t('portal.sections.documents')} description={t('portal.documents.description')} query={query} empty={!docs.length} emptyTitle={t('portal.documents.empty')}>
      <Card>
        <ul className="divide-y divide-[var(--border)] text-sm">
          {docs.map((doc) => (
            <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="grid">
                <span>{t(`portal.documents.types.${doc.document_type}`, { defaultValue: doc.document_type })}</span>
                <span className="text-xs text-[var(--text-muted)]"><span dir="ltr">{doc.reference_no}</span>{doc.file_name && <> · <span dir="ltr">{doc.file_name}</span></>}{doc.rejection_reason && <> · <bdi>{doc.rejection_reason}</bdi></>}</span>
              </span>
              <span className="flex items-center gap-2"><StatusPill tone={TONE[doc.status]}>{t(`portal.documents.statuses.${doc.status}`)}</StatusPill>{can('document', 'upload') && <DocumentUploadButton document={doc} />}</span>
            </li>
          ))}
        </ul>
      </Card>
    </PortalPage>
  )
}
