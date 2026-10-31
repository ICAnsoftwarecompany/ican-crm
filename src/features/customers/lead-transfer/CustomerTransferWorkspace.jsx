import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Download, Plus, Upload } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { useAuthStore } from '../../../store/authStore'
import { resolveTenantId } from '../../../services/tenantResolver'
import { customersApi } from '../api/customersApi'
import { LeadCreateDrawer } from '../lead-create/LeadCreateDrawer'
import { buildLeadCreatePayload, emptyLeadForm } from '../lead-create/leadCreateModel'
import { CustomerReviewTable } from './CustomerReviewTable'
import { fetchAllCustomers, readCustomerFile } from './customerTransfer'

export function CustomerTransferWorkspace() {
  const { t } = useTranslation()
  const tr = (key, options) => t(`customers.transfer.${key}`, options)
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const fileRef = useRef(null)
  const [tab, setTab] = useState('import')
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [format, setFormat] = useState('xlsx')
  const [exportedCount, setExportedCount] = useState(null)
  const keyRef = useRef(0)
  const stamp = (items, state) => items.map((item) => ({ ...item, reviewKey: ++keyRef.current, state }))
  const readFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError(''); setBusy(true)
    try {
      const items = await readCustomerFile(file)
      if (!items.length) throw new Error(tr('emptyFile'))
      setRows((current) => [...current, ...stamp(items, 'pending')])
    } catch (cause) { setError(extractMessage(cause, tr('failed'))) }
    finally { setBusy(false); event.target.value = '' }
  }
  const saveFileRows = async () => {
    if (busy) return
    const tenantId = resolveTenantId(user)
    if (!tenantId) return setError(t('customers.leadCreate.tenantMissing'))
    setBusy(true); setError('')
    try {
      for (const row of rows.filter((item) => item.state !== 'saved')) {
        try {
          if (!row.name?.trim() || !row.phone?.trim()) throw new Error(t('customers.newCustomerDialog.nameAndPhoneRequired'))
          const payload = buildLeadCreatePayload({ ...emptyLeadForm(user), ...row }, { tenantId, userId: user?.id })
          const response = await customersApi.createCustomers(payload)
          if (response?.success === false) throw new Error(response.message || tr('failed'))
          setRows((current) => current.map((item) => item.reviewKey === row.reviewKey ? { ...item, state: 'saved', error: '' } : item))
        } catch (cause) {
          setRows((current) => current.map((item) => item.reviewKey === row.reviewKey ? { ...item, state: 'failed', error: extractMessage(cause, tr('failed')) } : item))
        }
      }
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    } finally { setBusy(false) }
  }
  const exportFile = async () => {
    setBusy(true); setError(''); setExportedCount(null)
    try {
      const customers = await fetchAllCustomers()
      const XLSX = await import('xlsx')
      const fields = ['id', 'name', 'phone', 'email', 'company', 'type', 'source', 'status_type_id', 'agent_id', 'tag_id', 'code', 'link_date']
      const sheet = XLSX.utils.json_to_sheet(customers.map((customer) => Object.fromEntries(fields.map((key) => [key, customer[key] ?? '']))), { header: fields })
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, sheet, 'Customers')
      XLSX.writeFile(workbook, `customers.${format}`, { bookType: format })
      setExportedCount(customers.length)
    } catch (cause) { setError(extractMessage(cause, tr('failed'))) }
    finally { setBusy(false) }
  }
  return <main className="min-w-0 space-y-4 text-[var(--text)]">
    <h1 className="text-xl font-bold">{t('customers.placeholders.importExport.title')}</h1>
    <div className="flex gap-2 border-b border-[var(--border)] pb-3" role="tablist">{['import', 'export'].map((value) => <Button key={value} role="tab" aria-selected={tab === value} disabled={busy} variant={tab === value ? 'primary' : 'ghost'} onClick={() => setTab(value)}>{tr(value)}</Button>)}</div>
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    <section role="tabpanel" className="min-w-0 space-y-4">
      {tab === 'import' ? <>
        <div className="flex flex-wrap items-center gap-2"><Button variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}><Upload size={16} />{tr('upload')}</Button><Button disabled={busy} onClick={() => setOpen(true)}><Plus size={16} />{t('customers.leadCreate.title')}</Button><Button variant="outline" loading={busy} disabled={!rows.some((row) => row.state !== 'saved')} onClick={saveFileRows}>{tr('saveRows')}</Button><span className="text-sm text-[var(--text-muted)]">{tr('savedCount', { count: rows.filter((row) => row.state === 'saved').length })}</span></div>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" aria-label={tr('upload')} onChange={readFile} />
        <CustomerReviewTable rows={rows} disabled={busy} onEdit={(reviewKey, key, value) => setRows((current) => current.map((row) => row.reviewKey === reviewKey ? { ...row, [key]: value, state: 'pending', error: '' } : row))} />
      </> : <div className="flex flex-wrap items-center gap-3"><select aria-label={tr('format')} className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3" value={format} onChange={(event) => setFormat(event.target.value)} disabled={busy}><option value="xlsx">Excel</option><option value="csv">CSV</option></select><Button loading={busy} onClick={exportFile}><Download size={16} />{tr('download')}</Button>{exportedCount != null && <p role="status" className="text-sm">{tr('exported', { count: exportedCount })}</p>}</div>}
    </section>
    {open && <LeadCreateDrawer open onClose={() => setOpen(false)} onCreated={(_response, customers) => setRows((current) => [...stamp(customers, 'saved'), ...current])} />}
  </main>
}
