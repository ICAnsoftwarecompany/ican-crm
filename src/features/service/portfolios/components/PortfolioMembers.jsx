import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Scale, Search, UserMinus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { formatDate } from '../../../../shared/utils/dateTime'
import { CustomerSelect } from '../../records/components/CustomerSelect'
import { usePortfolioMembers, usePortfolioMutations } from '../api/portfoliosApi'

/** Customers of one portfolio: add (goes to the least loaded owner), move to another owner, remove, rebalance. */
export function PortfolioMembers({ portfolio }) {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [customerId, setCustomerId] = useState('')
  const debounced = useDebounce(search, 300)
  const members = usePortfolioMembers(portfolio.id, { search: debounced || undefined, owner_id: ownerFilter || undefined })
  const { addMembers, setOwner, removeMember, distribute } = usePortfolioMutations()
  const owners = (portfolio.owners || []).map((owner) => ({ value: owner.id, label: owner.name }))

  const add = () =>
    addMembers.mutate({ id: portfolio.id, customer_ids: [customerId] }, {
      onSuccess: () => {
        toast.success(t('service.portfolios.done.added'))
        setCustomerId('')
      },
    })
  const rebalance = () => distribute.mutate(portfolio.id, { onSuccess: (result) => toast.success(t('service.portfolios.done.distributed', { count: result?.moved || 0 })) })

  return (
    <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-label={t('service.portfolios.members')}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <CustomerSelect value={customerId} onChange={setCustomerId} />
          <Button onClick={add} disabled={!customerId || addMembers.isPending}>{t('service.portfolios.addCustomer')}</Button>
        </div>
        <Button variant="outline" onClick={rebalance} disabled={distribute.isPending || !portfolio.members_count}>
          <Scale size={16} aria-hidden="true" />
          {t('service.portfolios.distribute')}
        </Button>
      </div>
      <p className="text-xs text-[var(--text-muted)]">{t('service.portfolios.addHint')}</p>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('service.portfolios.searchMembers')} aria-label={t('service.portfolios.searchMembers')} startIcon={<Search size={16} aria-hidden="true" />} />
        <Select aria-label={t('service.portfolios.fields.owner')} placeholder={t('service.portfolios.allOwners')} value={ownerFilter} onChange={setOwnerFilter} options={owners} />
      </div>
      <ResourceState isLoading={members.isLoading} error={members.error} onRetry={members.refetch} empty={!members.data?.length} emptyTitle={t('service.portfolios.noMembers')}>
        <ul className="divide-y divide-[var(--border)]">
          {(members.data || []).map((member) => (
            <li key={member.customer_id} className="grid gap-2 py-2 sm:grid-cols-[minmax(0,1fr)_14rem_auto] sm:items-center">
              <span className="grid">
                <span className="text-sm font-medium text-[var(--text)]">{member.customer?.name}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  <span dir="ltr">{member.customer?.phone}</span>
                  {' · '}
                  {t('service.portfolios.since', { date: formatDate(member.assigned_at, i18n.language) })}
                </span>
              </span>
              <Select aria-label={t('service.portfolios.fields.owner')} value={member.owner_user_id} onChange={(ownerId) => ownerId && setOwner.mutate({ id: portfolio.id, customerId: member.customer_id, ownerId }, { onSuccess: () => toast.success(t('service.portfolios.done.moved')) })} options={owners} />
              <Button variant="ghost" size="icon" aria-label={t('service.portfolios.removeCustomer')} title={t('service.portfolios.removeCustomer')} onClick={() => removeMember.mutate({ id: portfolio.id, customerId: member.customer_id }, { onSuccess: () => toast.success(t('service.portfolios.done.removed')) })}>
                <UserMinus size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      </ResourceState>
    </section>
  )
}
