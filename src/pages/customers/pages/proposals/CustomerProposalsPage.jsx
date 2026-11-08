import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Edit3, Eye, FileSignature, Plus, Search, Trash2, Info, Workflow, Settings2, Files } from 'lucide-react'
import { toast } from 'sonner'

import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { useProposalMutations, useProposals, useProposalTemplates } from '../../../../features/proposals'
import { useUsers } from '../../../../features/users/hooks/useUsers'
import { formatDate, formatMoney, getProposalCustomer } from './utils/proposalPayloads'
import { ProposalWizard } from './components/ProposalWizard'

export function CustomerProposalsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const view = searchParams.get('view')
  const action = searchParams.get('action')
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const wizardOpen = isWizardOpen || action === 'new'
  const closeWizard = () => { setIsWizardOpen(false); if (action === 'new') setSearchParams({}) }
  const [filters, setFilters] = useState({ search: '', status: '', assigned_to: '' })
  const proposalsQuery = useProposals(filters)
  const usersQuery = useUsers()
  const templatesQuery = useProposalTemplates()
  const mutations = useProposalMutations()

  const proposals = proposalsQuery.data || []
  const users = usersQuery.data || []
  const templatesById = useMemo(() => new Map((templatesQuery.data || []).map(template => [String(template.id), template])), [templatesQuery.data])

  const visibleProposals = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return proposals.filter((proposal) => {
      const customer = getProposalCustomer(proposal)
      const template = templatesById.get(String(proposal.template_id || proposal.metadata?.source_template_id))
      const haystack = [proposal.title, proposal.description, customer?.name, customer?.email, template?.name, proposal.metadata?.source_template_name].filter(Boolean).join(' ').toLowerCase()
      return !search || haystack.includes(search)
    })
  }, [filters.search, proposals, templatesById])

  const handleDelete = async (proposal) => {
    if (!window.confirm(t('proposals.page.confirmDelete', { title: proposal.title || proposal.id }))) return
    await mutations.deleteProposal.mutateAsync(proposal.id)
    toast.success(t('proposals.page.deletedToast'))
  }

  return (
    <div className="space-y-6">
      <PageToolbar title={t('proposals.page.pageTitle')} description={t('proposals.page.pageDescription')}>
        <Link to="/LeadsCenter/proposals/templates">
          <Button variant="outline">
            <FileSignature size={16} />
            {t('proposals.page.templates')}
          </Button>
        </Link>
        <Button onClick={() => setIsWizardOpen(true)}>
          <Plus size={16} />
          {t('proposals.page.newProposal')}
        </Button>
      </PageToolbar>

      {view === 'settings' || view === 'automation' ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-[var(--surface-2)] p-3">{view === 'settings' ? <Settings2 size={22}/> : <Workflow size={22}/>}</span><div><h2 className="font-bold text-[var(--text)]">{t('proposals.workspace.' + view)}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">{t('proposals.workspace.' + view + 'Help')}</p></div></div>
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-7 text-[var(--text-muted)]">{t('proposals.workspace.notConfigured')}</div>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/LeadsCenter/proposals')}>{t('proposals.workspace.list')}</Button>
        </section>
      ) : <>
      <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]"><Info size={19} className="mt-0.5 shrink-0 text-[var(--brand-accent)]"/><span>{t('proposals.workspace.listHelp')}</span></div>
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <Input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder={t('proposals.page.searchPlaceholder')}
            startIcon={<Search size={16} />}
          />
          <Select
            value={filters.status}
            onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
            options={[
              { value: 'draft', label: t('proposals.page.status.draft') },
              { value: 'sent', label: t('proposals.page.status.sent') },
              { value: 'accepted', label: t('proposals.page.status.accepted') },
              { value: 'rejected', label: t('proposals.page.status.rejected') },
            ]}
            placeholder={t('customers.page.allStatuses')}
          />
          <Select
            value={filters.assigned_to}
            onChange={(value) => setFilters((current) => ({ ...current, assigned_to: value }))}
            options={users.map((user) => ({ value: String(user.id), label: user.name || user.email || `User #${user.id}` }))}
            placeholder={t('proposals.page.allUsers')}
          />
          <Button variant="ghost" onClick={() => setFilters({ search: '', status: '', assigned_to: '' })}>
            {t('proposals.page.resetFilters')}
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="grid grid-cols-[1.3fr_1fr_1fr_.7fr_.8fr_auto] gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-xs font-black text-[var(--text-muted)]">
          <div>{t('proposals.page.columnProposal')}</div>
          <div>{t('proposals.wizard.steps.customer')}</div>
          <div>القالب / الإصدار</div>
          <div>{t('proposals.pricing.totalLabel')}</div>
          <div>{t('customers.table.status')}</div>
          <div>{t('proposals.page.columnActions')}</div>
        </div>

        {proposalsQuery.isLoading ? (
          <div className="p-10 text-center text-sm font-black text-[var(--text-muted)]">{t('proposals.page.loadingProposals')}</div>
        ) : null}

        {!proposalsQuery.isLoading && !visibleProposals.length ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F9FA] text-[#007A80]">
              <FileSignature size={22} />
            </div>
            <p className="text-sm font-black text-[var(--text)]">{t('proposals.page.noProposalsYet')}</p>
            <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">{t('proposals.page.noProposalsHint')}</p>
          </div>
        ) : null}

        {visibleProposals.map((proposal) => {
          const customer = getProposalCustomer(proposal)
          const metadata = proposal.metadata || {}
          const templateId = proposal.template_id || metadata.source_template_id
          const template = templatesById.get(String(templateId))
          const templateName = metadata.source_template_name || proposal.template?.name || template?.name
          const sourceVersion = metadata.source_template_version_name || proposal.template_version?.name || (metadata.source_template_version_number ? `Version ${metadata.source_template_version_number}` : null)
          return (
            <div key={proposal.id} className="grid grid-cols-[1.4fr_1fr_.7fr_.8fr_auto] items-center gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0 hover:bg-[var(--surface-2)]">
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-[var(--text)]">{proposal.title || t('proposals.page.proposalFallback', { id: proposal.id })}</div>
                <div className="mt-1 truncate text-xs font-semibold text-[var(--text-muted)]">{proposal.description || t('proposals.page.expiresPrefix', { date: formatDate(proposal.expires_at, i18n.language) })}</div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-[var(--text)]">{customer?.name || '-'}</div>
                <div className="truncate text-xs font-semibold text-[var(--text-muted)]">{customer?.email || customer?.phone || '-'}</div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-[var(--text)]">{templateName || (templateId ? `قالب #${templateId}` : 'غير محدد')}</div>
                <div className="mt-1 truncate text-xs font-semibold text-[var(--text-muted)]">{sourceVersion || 'الإصدار غير متاح'}</div>
              </div>
              <div className="text-sm font-black text-[var(--text)]" dir="ltr">{formatMoney(proposal.total ?? proposal.current_version?.total, proposal.currency)}</div>
              <div>
                <span className="rounded-full border border-[#DCE8F3] bg-[var(--surface-2)] px-2 py-1 text-xs font-black text-[var(--text-muted)]">
                  {t(`proposals.page.status.${proposal.status || 'draft'}`, { defaultValue: proposal.status || 'draft' })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/LeadsCenter/proposals/${proposal.id}/builder`)} aria-label={t('proposals.page.openBuilder')}>
                  <Edit3 size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate(`/LeadsCenter/proposals/${proposal.id}/builder?preview=1`)} aria-label={t('proposals.page.preview')}>
                  <Eye size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="text-[#EF4444]" onClick={() => handleDelete(proposal)} aria-label={t('proposals.page.delete')}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          )
        })}
      </section>

      </>}
      <ProposalWizard open={wizardOpen} onClose={closeWizard} />
    </div>
  )
}
