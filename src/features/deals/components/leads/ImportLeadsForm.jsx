import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { isDealApiLive } from '../../constants/dealApiStatus'
import { useDealLeadMutations } from '../../hooks/useDealLeads'
import { FieldLabel } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'
import { PlannedNotice } from '../common/PlannedNotice'

/** Excel/CSV import (`name | phone | email`) — planned endpoint `POST /deals/leads/import` (multipart). */
export function ImportLeadsForm({ dealId, people, onDone }) {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [ownerId, setOwnerId] = useState('')
  const { importFile } = useDealLeadMutations(dealId)
  const live = isDealApiLive('leadsImport')

  const submit = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('deal_id', dealId)
    formData.append('file', file)
    if (ownerId) formData.append('owner_id', ownerId)
    try {
      const response = await importFile.mutateAsync(formData)
      const data = response?.data || response || {}
      toast.success(t('dealWorkspace.leads.import.success', { created: data.created ?? 0, duplicates: data.duplicates ?? 0 }))
      onDone()
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.leads.import.failed')))
    }
  }

  return (
    <div className="space-y-3">
      <PlannedNotice capability="leadsImport" />
      <p className="flex items-start gap-2 text-sm text-[var(--text-muted)]"><FileSpreadsheet size={16} className="mt-0.5 shrink-0" />{t('dealWorkspace.leads.import.format')}</p>
      <FieldLabel label={t('dealWorkspace.leads.import.file')}>
        <input type="file" accept=".xlsx,.xls,.csv" disabled={!live} onChange={(event) => setFile(event.target.files?.[0] || null)} className="block w-full text-sm text-[var(--text)]" />
      </FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.owner')}><PersonSelect people={people} value={ownerId} onChange={setOwnerId} disabled={!live} /></FieldLabel>
      <div className="flex justify-end"><Button onClick={submit} disabled={!live || !file || importFile.isPending} loading={importFile.isPending}>{t('dealWorkspace.leads.import.submit')}</Button></div>
    </div>
  )
}
