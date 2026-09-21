import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Bot, CalendarDays, LayoutGrid, List, Package, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AgentChat } from '../../features/ai-agent/components/AgentChat'
import { useDeal, useDealLeads, useDealMutations, useDealResources, usePipelineTemplates } from '../../features/deals'
import { WorkflowLauncher } from '../../features/workflow-engine'
import { DataTable } from '../../shared/components/data-table'
import { AppDrawer } from '../../shared/components/overlays/AppDrawer'
import { PipelineBoard, PipelineCard } from '../../shared/components/pipeline-board'
import { Button } from '../../shared/components/ui/Button'
import { useLocalStorage } from '../../shared/components/data-table/hooks/useLocalStorage'
import { cn } from '../../shared/utils/cn'

const tabs = ['overview', 'board', 'team', 'products', 'contracts', 'analytics']

function normalizeLead(item) {
  const lead = item.lead || item.customer || {}
  return { ...lead, ...item, name: lead.name || item.name, phone: lead.phone || item.phone, source: lead.source || item.source }
}

export function DealWorkspacePage() {
  const { t } = useTranslation()
  const { dealId } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const activeTab = tabs.includes(params.get('tab')) ? params.get('tab') : 'board'
  const [viewMode, setViewMode] = useLocalStorage('deal-workspace:view-mode', 'kanban')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const dealQuery = useDeal(dealId)
  const leadsQuery = useDealLeads(dealId)
  const templatesQuery = usePipelineTemplates()
  const resources = useDealResources(dealId)
  const mutations = useDealMutations()
  const deal = dealQuery.deal || {}
  const leads = useMemo(() => leadsQuery.leads.map(normalizeLead), [leadsQuery.leads])
  const template = deal.pipeline_template || deal.pipelineTemplate || templatesQuery.templates.find((item) => String(item.id) === String(deal.pipeline_template_id))
  const stages = useMemo(() => (template?.stages || deal.stages || []).slice().sort((a, b) => Number(a.order) - Number(b.order)).map((stage) => ({ ...stage, label: stage.name })), [deal.stages, template?.stages])
  const stageMap = useMemo(() => new Map(stages.map((stage) => [String(stage.id), stage])), [stages])
  const leadColumns = useMemo(() => [
    { id: 'name', header: t('dealWorkspace.fields.name'), accessor: 'name', filterType: 'text' },
    { id: 'phone', header: t('dealWorkspace.fields.phone'), accessor: 'phone', filterType: 'text' },
    { id: 'stage_id', header: t('dealWorkspace.fields.stage'), accessor: 'stage_id', filterType: 'select', filterOptions: stages.map((stage) => ({ value: stage.id, label: stage.name })), render: (row) => { const stage = stageMap.get(String(row.stage_id)); return <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ backgroundColor: stage?.color || 'var(--surface-2)' }}>{stage?.name || '-'}</span> } },
    { id: 'owner', header: t('dealWorkspace.fields.owner'), accessor: 'owner.name', render: (row) => row.owner?.name || row.user?.name || '-' },
    { id: 'source', header: t('dealWorkspace.fields.source'), accessor: 'source', filterType: 'text' },
  ], [stageMap, stages, t])
  const selectTab = (tab) => setParams({ tab })

  const toolbar = <div className="flex flex-wrap items-center gap-2">
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
      <Button size="sm" variant={viewMode === 'kanban' ? 'primary' : 'ghost'} onClick={() => { setViewMode('kanban'); selectTab('board') }}><LayoutGrid size={15} />{t('dealWorkspace.viewToggle.kanban')}</Button>
      <Button size="sm" variant={viewMode === 'table' ? 'primary' : 'ghost'} onClick={() => setViewMode('table')}><List size={15} />{t('dealWorkspace.viewToggle.table')}</Button>
    </div>
    <Button variant="outline" size="sm" onClick={() => navigate('/calendar')}><CalendarDays size={15} />{t('dealWorkspace.actions.calendar')}</Button>
    <WorkflowLauncher context={{ module: 'deals', entity: 'deal', entityId: dealId }}><span>{t('dealWorkspace.actions.workflow')}</span></WorkflowLauncher>
    <Button variant="ai" size="sm" onClick={() => setAiOpen(true)}><Bot size={15} />{t('dealWorkspace.actions.ai')}</Button>
  </div>

  const board = <PipelineBoard stages={stages} items={leads} renderEmpty={() => <div className="rounded-md border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">{t('dealWorkspace.board.empty')}</div>} renderCard={(lead) => <PipelineCard><div className="font-semibold">{lead.name || '-'}</div><div dir="ltr" className="mt-1 text-xs text-[var(--text-muted)]">{lead.phone || '-'}</div></PipelineCard>} onItemMove={(itemId, fromStageId, stageId) => mutations.changeStage.mutateAsync({ dealLeadId: itemId, stageId })} onTerminalStageDrop={() => {}} />

  const sectionContent = () => {
    if (activeTab === 'board') return viewMode === 'table' ? <DataTable data={leads} columns={leadColumns} tableId={`deal-${dealId}-leads`} isLoading={leadsQuery.isLoading} error={leadsQuery.error} onRetry={leadsQuery.refetch} enableSorting enableFiltering enableGlobalSearch enableColumnVisibility enableExport showToolbar showFooter /> : board
    if (activeTab === 'team') return <SimpleList icon={Users} items={resources.team.items} getLabel={(item) => item.user?.name || item.team?.name || item.name} />
    if (activeTab === 'products') return <SimpleList icon={Package} items={resources.products.items} getLabel={(item) => item.product?.name || item.name} />
    if (activeTab === 'overview') return <div className="grid gap-3 sm:grid-cols-3"><Metric label={t('dealWorkspace.fields.leads')} value={leads.length} /><Metric label={t('dealWorkspace.fields.revenue')} value={deal.target_revenue || 0} /><Metric label={t('dealWorkspace.fields.status')} value={t(`dealWorkspace.statuses.${deal.status}`, deal.status)} /></div>
    return <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--text-muted)]">{t('dealWorkspace.unavailable')}</div>
  }

  return <div className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><Link to="/deals" className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">{t('dealWorkspace.back')}</Link><h1 className="mt-1 text-xl font-bold text-[var(--text)]">{deal.name || t('dealWorkspace.loading')}</h1></div>{toolbar}</div>
    <div className={cn(viewMode === 'table' && 'grid min-h-[560px]', viewMode === 'table' && (sidebarCollapsed ? 'grid-cols-[64px_minmax(0,1fr)]' : 'grid-cols-[210px_minmax(0,1fr)]'))}>
      {viewMode === 'table' && <aside className="border-e border-[var(--border)] bg-[var(--surface)] p-2"><button className="mb-3 w-full rounded-md p-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)]" onClick={() => setSidebarCollapsed((v) => !v)}>{sidebarCollapsed ? '»' : '«'}</button>{tabs.map((tab) => <button key={tab} onClick={() => tab === 'board' ? setViewMode('kanban') : selectTab(tab)} title={t(`dealWorkspace.tabs.${tab}`)} className={cn('mb-1 flex w-full items-center rounded-md p-2 text-sm', sidebarCollapsed ? 'justify-center' : '', activeTab === tab ? 'bg-[var(--surface-2)] text-[var(--text)]' : 'text-[var(--text-muted)]')}>{sidebarCollapsed ? t(`dealWorkspace.tabs.${tab}`).slice(0, 1) : t(`dealWorkspace.tabs.${tab}`)}</button>)}</aside>}
      <main className="min-w-0 p-3">{viewMode === 'kanban' && <div className="mb-4 flex gap-1 overflow-x-auto border-b border-[var(--border)]">{tabs.map((tab) => <button key={tab} onClick={() => selectTab(tab)} className={cn('whitespace-nowrap border-b-2 px-3 py-2 text-sm', activeTab === tab ? 'border-[var(--brand-accent)] text-[var(--text)]' : 'border-transparent text-[var(--text-muted)]')}>{t(`dealWorkspace.tabs.${tab}`)}</button>)}</div>}{sectionContent()}</main>
    </div>
    <AppDrawer open={aiOpen} onClose={() => setAiOpen(false)} title={t('dealWorkspace.actions.ai')} size="lg"><AgentChat /></AppDrawer>
  </div>
}

function Metric({ label, value }) { return <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4"><div className="text-xs text-[var(--text-muted)]">{label}</div><div className="mt-2 text-xl font-bold text-[var(--text)]">{value}</div></div> }
function SimpleList({ icon: Icon, items, getLabel }) { return <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <div key={item.id || index} className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3"><Icon size={16} /><span>{getLabel(item) || '-'}</span></div>)}</div> }
