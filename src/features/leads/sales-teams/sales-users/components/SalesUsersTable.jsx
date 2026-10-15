import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../../../../../shared/components/data-table'
import { Avatar } from '../../../../../shared/components/ui/Avatar'
import { Badge } from '../../../../../shared/components/ui/Badge'
import { DEFAULT_ROLES, DEFAULT_TYPES, isSalesUser, valueSuggestions } from '../utils/salesUsersModel'
import { ActiveCell, ManagerCell, PriorityCell, ValueCell } from './SalesUserCells'

/** The users table (shared DataTable): rank, user, manager, role, type, status — each cell edits one field. */
export function SalesUsersTable({ rows, allUsers, state, duplicates }) {
  const { t } = useTranslation()
  const busy = Boolean(state.bulk)
  const saving = (user, field) => state.savingKey === `${user.id}:${field}`
  const roles = valueSuggestions(allUsers, 'role', DEFAULT_ROLES)
  const types = valueSuggestions(allUsers, 'type', DEFAULT_TYPES)

  const columns = useMemo(() => [
    {
      id: 'priority', header: t('salesTeams.salesUsers.columns.priority'), accessor: 'priority', customWidth: 200, searchable: false,
      render: (user) => {
        const index = rows.indexOf(user)
        return (
          <PriorityCell
            user={user}
            users={allUsers}
            neighbours={{ previous: rows[index - 1], next: rows[index + 1] }}
            saving={saving(user, 'priority')}
            disabled={busy}
            onSave={(value) => state.updateField(user, 'priority', value)}
            onSwap={state.swap}
          />
        )
      },
    },
    {
      id: 'name', header: t('salesTeams.salesUsers.columns.user'), accessor: 'name', customWidth: 300,
      render: (user) => (
        <span className="flex min-w-[12rem] items-center gap-2">
          <Avatar name={user.name} size="sm" />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="whitespace-nowrap font-semibold text-[var(--text)]">{user.name}</span>
              {isSalesUser(user) && <Badge variant="info">{t('salesTeams.salesUsers.salesBadge')}</Badge>}
              {duplicates.has(user.priority) && <Badge variant="warning">{t('salesTeams.salesUsers.duplicateBadge')}</Badge>}
            </span>
            <span className="block truncate text-xs text-[var(--text-muted)]" dir="ltr">{user.email || user.username}</span>
          </span>
        </span>
      ),
    },
    {
      id: 'manager', header: t('salesTeams.salesUsers.columns.manager'), accessor: 'managerName', customWidth: 210, searchable: false,
      render: (user) => <ManagerCell user={user} users={allUsers} saving={saving(user, 'manager_id')} disabled={busy} onSave={(value) => state.updateField(user, 'manager_id', value)} />,
    },
    {
      id: 'role', header: t('salesTeams.salesUsers.columns.role'), accessor: 'role', customWidth: 180,
      render: (user) => <ValueCell user={user} field="role" listId="sales-users-roles" label={t('salesTeams.salesUsers.roleOf', { name: user.name })} saving={saving(user, 'role')} disabled={busy} onSave={(value) => state.updateField(user, 'role', value)} />,
    },
    {
      id: 'type', header: t('salesTeams.salesUsers.columns.type'), accessor: 'type', customWidth: 180,
      render: (user) => <ValueCell user={user} field="type" listId="sales-users-types" label={t('salesTeams.salesUsers.typeOf', { name: user.name })} saving={saving(user, 'type')} disabled={busy} onSave={(value) => state.updateField(user, 'type', value)} />,
    },
    {
      id: 'active', header: t('salesTeams.salesUsers.columns.status'), accessor: 'active', customWidth: 140, searchable: false,
      render: (user) => <ActiveCell user={user} saving={saving(user, 'active')} disabled={busy} onSave={(value) => state.updateField(user, 'active', value)} />,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [rows, allUsers, state.savingKey, busy, duplicates, t])

  return (
    <>
      <datalist id="sales-users-roles">{roles.map((value) => <option key={value} value={value} />)}</datalist>
      <datalist id="sales-users-types">{types.map((value) => <option key={value} value={value} />)}</datalist>
      <DataTable
        data={rows}
        columns={columns}
        tableId="sales-teams-users"
        isLoading={state.query.isLoading}
        error={state.query.error}
        onRetry={state.query.refetch}
        emptyMessage={t('salesTeams.salesUsers.empty')}
        enableSorting={false}
        enableFiltering={false}
        enableGlobalSearch={false}
        enableColumnVisibility
        enableExport
        showToolbar
        showFooter
      />
    </>
  )
}
