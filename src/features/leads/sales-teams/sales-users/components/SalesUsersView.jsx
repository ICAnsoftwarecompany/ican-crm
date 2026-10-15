import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ListOrdered, Search, UserCheck, UserCog, Users } from 'lucide-react'
import { ModuleNotice, ModulePageHeader } from '../../../../../shared/components/module-pages'
import { KpiRow } from '../../../../../shared/components/reports'
import { ConfirmDialog } from '../../../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { Tabs } from '../../../../../shared/components/ui/Tabs'
import { useSalesUsers } from '../hooks/useSalesUsers'
import { duplicatePriorities, filterSalesUsers, isSalesUser, renumberPlan } from '../utils/salesUsersModel'
import { SalesUsersTable } from './SalesUsersTable'

/** /LeadsCenter/teams/users — sales users ranked by priority, with manager, role, type and status edited inline. */
export function SalesUsersView() {
  const { t } = useTranslation()
  const state = useSalesUsers()
  const [scope, setScope] = useState('sales')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [confirmRenumber, setConfirmRenumber] = useState(false)
  const { users } = state
  const salesUsers = users.filter(isSalesUser)
  const rows = filterSalesUsers(users, { scope, search, status: status || 'all' })
  const scoped = filterSalesUsers(users, { scope })
  const duplicates = duplicatePriorities(users)
  const plan = renumberPlan(scoped)

  const kpis = [
    { id: 'sales', icon: UserCheck, label: t('salesTeams.salesUsers.kpis.sales'), value: salesUsers.length, hint: t('salesTeams.salesUsers.kpis.ofUsers', { count: users.length }) },
    { id: 'active', icon: Users, label: t('salesTeams.salesUsers.kpis.active'), value: salesUsers.filter((user) => user.active).length },
    { id: 'ranked', icon: ListOrdered, label: t('salesTeams.salesUsers.kpis.ranked'), value: salesUsers.filter((user) => user.priority).length, hint: t('salesTeams.salesUsers.kpis.rankedHint') },
    { id: 'duplicates', icon: AlertTriangle, label: t('salesTeams.salesUsers.kpis.duplicates'), value: duplicates.size, positiveIsGood: false },
  ]

  return (
    <div className="space-y-4">
      <ModulePageHeader
        icon={UserCog}
        title={t('salesTeams.salesUsers.title')}
        description={t('salesTeams.salesUsers.description')}
        actions={(
          <Button variant="outline" onClick={() => setConfirmRenumber(true)} disabled={!plan.length || Boolean(state.bulk)}>
            <ListOrdered size={16} />
            {t('salesTeams.salesUsers.renumber')}
          </Button>
        )}
      />
      <KpiRow items={kpis} />

      {state.bulk && <ModuleNotice>{t('salesTeams.salesUsers.bulkProgress', { done: state.bulk.done, total: state.bulk.total })}</ModuleNotice>}
      {duplicates.size > 0 && (
        <ModuleNotice tone="warning">
          {t('salesTeams.salesUsers.duplicatesNotice', { list: [...duplicates].map(([priority, list]) => `${priority}: ${list.map((user) => user.name).join(' / ')}`).join(' · ') })}
        </ModuleNotice>
      )}

      <Tabs
        variant="underline"
        active={scope}
        onChange={setScope}
        items={[
          { id: 'sales', label: `${t('salesTeams.salesUsers.scopes.sales')} (${salesUsers.length})` },
          { id: 'all', label: `${t('salesTeams.salesUsers.scopes.all')} (${users.length})` },
        ]}
      />
      {scope === 'sales' && !state.query.isLoading && salesUsers.length === 0 && users.length > 0 && (
        <ModuleNotice>
          {t('salesTeams.salesUsers.noSalesYet')}{' '}
          <button type="button" onClick={() => setScope('all')} className="font-semibold text-[var(--brand-accent)] hover:underline">{t('salesTeams.salesUsers.showAll')}</button>
        </ModuleNotice>
      )}

      <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-[minmax(0,1fr)_180px]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('salesTeams.salesUsers.search')} aria-label={t('salesTeams.salesUsers.search')} startIcon={<Search size={15} />} />
        <Select
          value={status}
          onChange={setStatus}
          placeholder={t('salesTeams.filters.allStatuses')}
          aria-label={t('salesTeams.filters.status')}
          options={[{ value: 'active', label: t('salesTeams.common.active') }, { value: 'inactive', label: t('salesTeams.common.inactive') }]}
        />
      </div>

      <SalesUsersTable rows={rows} allUsers={users} state={state} duplicates={duplicates} />

      <ConfirmDialog
        isOpen={confirmRenumber}
        onCancel={() => setConfirmRenumber(false)}
        onConfirm={async () => { setConfirmRenumber(false); await state.applyPriorities(plan, 'salesTeams.salesUsers.renumbered') }}
        title={t('salesTeams.salesUsers.renumberTitle')}
        message={t('salesTeams.salesUsers.renumberMessage', { count: plan.length })}
        confirmText={t('salesTeams.salesUsers.renumberConfirm')}
      />
    </div>
  )
}
