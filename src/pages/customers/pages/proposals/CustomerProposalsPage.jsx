import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Edit3, Eye, FileSignature, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { useProposalMutations, useProposals } from '../../../../features/proposals'
import { useUsers } from '../../../../features/users/hooks/useUsers'
import { formatDate, formatMoney, getProposalCustomer } from './utils/proposalPayloads'
import { ProposalWizard } from './components/ProposalWizard'

export function CustomerProposalsPage() {
  const navigate = useNavigate()
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [filters, setFilters] = useState({ search: '', status: '', assigned_to: '' })
  const proposalsQuery = useProposals(filters)
  const usersQuery = useUsers()
  const mutations = useProposalMutations()

  const proposals = proposalsQuery.data || []
  const users = usersQuery.data || []

  const visibleProposals = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return proposals.filter((proposal) => {
      const customer = getProposalCustomer(proposal)
      const haystack = [proposal.title, proposal.description, customer?.name, customer?.email].filter(Boolean).join(' ').toLowerCase()
      return !search || haystack.includes(search)
    })
  }, [filters.search, proposals])

  const handleDelete = async (proposal) => {
    if (!window.confirm(`هل تريد حذف العرض "${proposal.title || proposal.id}"؟`)) return
    await mutations.deleteProposal.mutateAsync(proposal.id)
    toast.success('تم حذف العرض')
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageToolbar title="عروض الأسعار" description="إدارة العروض وفتح الـ Visual Builder لإنشاء Proposal احترافي بدون التعامل مع JSON.">
        <Link to="/LeadsCenter/proposals/templates">
          <Button variant="outline">
            <FileSignature size={16} />
            القوالب
          </Button>
        </Link>
        <Button onClick={() => setIsWizardOpen(true)}>
          <Plus size={16} />
          عرض جديد
        </Button>
      </PageToolbar>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <Input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="بحث باسم العرض أو العميل..."
            startIcon={<Search size={16} />}
          />
          <Select
            value={filters.status}
            onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'sent', label: 'Sent' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            placeholder="كل الحالات"
          />
          <Select
            value={filters.assigned_to}
            onChange={(value) => setFilters((current) => ({ ...current, assigned_to: value }))}
            options={users.map((user) => ({ value: String(user.id), label: user.name || user.email || `User #${user.id}` }))}
            placeholder="كل المستخدمين"
          />
          <Button variant="ghost" onClick={() => setFilters({ search: '', status: '', assigned_to: '' })}>
            إعادة
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="grid grid-cols-[1.4fr_1fr_.7fr_.8fr_auto] gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-xs font-black text-[var(--text-muted)]">
          <div>العرض</div>
          <div>العميل</div>
          <div>الإجمالي</div>
          <div>الحالة</div>
          <div>إجراءات</div>
        </div>

        {proposalsQuery.isLoading ? (
          <div className="p-10 text-center text-sm font-black text-[var(--text-muted)]">جاري تحميل العروض...</div>
        ) : null}

        {!proposalsQuery.isLoading && !visibleProposals.length ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F9FA] text-[#007A80]">
              <FileSignature size={22} />
            </div>
            <p className="text-sm font-black text-[var(--text)]">لا توجد عروض بعد</p>
            <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">ابدأ من زر عرض جديد واختر العميل والقالب.</p>
          </div>
        ) : null}

        {visibleProposals.map((proposal) => {
          const customer = getProposalCustomer(proposal)
          return (
            <div key={proposal.id} className="grid grid-cols-[1.4fr_1fr_.7fr_.8fr_auto] items-center gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0 hover:bg-[#F8FAFC]">
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-[var(--text)]">{proposal.title || `Proposal #${proposal.id}`}</div>
                <div className="mt-1 truncate text-xs font-semibold text-[var(--text-muted)]">{proposal.description || `ينتهي: ${formatDate(proposal.expires_at)}`}</div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-[var(--text)]">{customer?.name || '-'}</div>
                <div className="truncate text-xs font-semibold text-[var(--text-muted)]">{customer?.email || customer?.phone || '-'}</div>
              </div>
              <div className="text-sm font-black text-[#162847]" dir="ltr">{formatMoney(proposal.total ?? proposal.current_version?.total, proposal.currency)}</div>
              <div>
                <span className="rounded-full border border-[#DCE8F3] bg-[#F8FAFC] px-2 py-1 text-xs font-black text-[var(--text-muted)]">
                  {proposal.status || 'draft'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/LeadsCenter/proposals/${proposal.id}/builder`)} aria-label="فتح Builder">
                  <Edit3 size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate(`/LeadsCenter/proposals/${proposal.id}/builder?preview=1`)} aria-label="معاينة">
                  <Eye size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="text-[#EF4444]" onClick={() => handleDelete(proposal)} aria-label="حذف">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          )
        })}
      </section>

      <ProposalWizard open={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  )
}
