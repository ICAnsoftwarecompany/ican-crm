import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useDealMutations, useDeals, usePipelineTemplates } from '../../features/deals'
import { DataTable } from '../../shared/components/data-table'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'

const initialForm = { name: '', pipeline_template_id: '', type: 'sales', status: 'active', start_date: '', end_date: '', target_revenue: '', target_leads: '' }

export function DealsHubPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const query = useDeals()
  const templatesQuery = usePipelineTemplates()
  const mutations = useDealMutations()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const columns = useMemo(() => [
    { id: 'name', header: t('dealWorkspace.fields.name'), accessor: 'name', sortable: true, filterType: 'text' },
    { id: 'status', header: t('dealWorkspace.fields.status'), accessor: 'status', filterType: 'select', render: (row) => <span className="rounded-full bg-[var(--surface-2)] px-2 py-1 text-xs font-semibold text-[var(--text)]">{t(`dealWorkspace.statuses.${row.status}`, row.status)}</span> },
    { id: 'owner', header: t('dealWorkspace.fields.owner'), accessor: 'owner.name', render: (row) => row.owner?.name || row.owner_name || '-' },
    { id: 'target_leads', header: t('dealWorkspace.fields.leads'), accessor: 'target_leads', render: (row) => `${row.leads_count ?? row.deal_leads_count ?? 0} / ${row.target_leads ?? '-'}` },
    { id: 'target_revenue', header: t('dealWorkspace.fields.revenue'), accessor: 'target_revenue', render: (row) => row.target_revenue == null ? '-' : new Intl.NumberFormat(i18n.language).format(row.target_revenue) },
    { id: 'dates', header: t('dealWorkspace.fields.startDate'), accessor: 'start_date', render: (row) => <span dir="ltr">{row.start_date || '-'} - {row.end_date || '-'}</span> },
  ], [i18n.language, t])

  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.pipeline_template_id) return toast.error(t('dealWorkspace.form.required'))
    const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ''))
    const response = await mutations.create.mutateAsync(payload)
    const id = response?.data?.id || response?.id
    toast.success(t('dealWorkspace.createDeal'))
    setOpen(false)
    setForm(initialForm)
    if (id) navigate(`/deals/${id}`)
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[var(--text)]">{t('dealWorkspace.title')}</h1>
        <Button onClick={() => setOpen(true)}><Plus size={16} />{t('dealWorkspace.createDeal')}</Button>
      </header>
      <DataTable data={query.deals} columns={columns} tableId="deals-workspace" isLoading={query.isLoading} error={query.error} onRetry={query.refetch} onRowDoubleClick={(row) => navigate(`/deals/${row.id}`)} emptyMessage={t('dealWorkspace.empty')} enableSorting enableFiltering enableGlobalSearch enablePagination enableColumnVisibility enableExport showToolbar showFooter />
      {open && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
        <form onSubmit={submit} className="w-full max-w-2xl rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-[var(--text)]">{t('dealWorkspace.form.title')}</h2><button type="button" onClick={() => setOpen(false)} aria-label={t('actions.close')}><X size={18} /></button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-[var(--text)]"><span>{t('dealWorkspace.fields.name')}</span><Input value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} /></label>
            <label className="space-y-1 text-sm text-[var(--text)]"><span>{t('dealWorkspace.fields.pipeline')}</span><select className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3" value={form.pipeline_template_id} onChange={(e) => setForm((v) => ({ ...v, pipeline_template_id: e.target.value }))}><option value="">-</option>{templatesQuery.templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            {['start_date', 'end_date'].map((key) => <label key={key} className="space-y-1 text-sm text-[var(--text)]"><span>{t(`dealWorkspace.fields.${key === 'start_date' ? 'startDate' : 'endDate'}`)}</span><Input type="date" value={form[key]} onChange={(e) => setForm((v) => ({ ...v, [key]: e.target.value }))} /></label>)}
            {['target_leads', 'target_revenue'].map((key) => <label key={key} className="space-y-1 text-sm text-[var(--text)]"><span>{t(`dealWorkspace.fields.${key === 'target_leads' ? 'leads' : 'revenue'}`)}</span><Input type="number" min="0" value={form[key]} onChange={(e) => setForm((v) => ({ ...v, [key]: e.target.value }))} /></label>)}
          </div>
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('dealWorkspace.form.cancel')}</Button><Button type="submit" disabled={mutations.create.isPending}>{t('dealWorkspace.form.save')}</Button></div>
        </form>
      </div>}
    </div>
  )
}
