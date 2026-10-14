import { useMemo, useState } from 'react'
import { Edit3, Plus, RefreshCw, UsersRound } from 'lucide-react'
import { Badge } from '../../shared/components/ui/Badge'
import { Button } from '../../shared/components/ui/Button'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { DataTable } from '../../shared/components/data-table'
import { useUsers, useUserMutations } from '../../features/users/hooks/useUsers'
import { useTeams } from '../../features/teams/hooks/useTeams'
import { displayValue, extractMessage } from '../../shared/utils/apiResponse'
import { UserFormDrawer } from './UserFormDrawer'

function normalizeId(value) {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('ar-EG')
}

function getUserLabel(user) {
  return user?.name || user?.username || user?.email || `User #${user?.id}`
}

function getTeamLabel(team) {
  return team?.name || team?.team_name || `Team #${team?.id || team?.team_id}`
}

export function UsersPage() {
  const usersQuery = useUsers()
  const teamsQuery = useTeams()
  const mutations = useUserMutations()
  const [drawerMode, setDrawerMode] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formError, setFormError] = useState('')

  const users = usersQuery.data || []
  const teams = teamsQuery.data || []
  const isDrawerOpen = Boolean(drawerMode)
  const isSaving = mutations.create.isPending || mutations.update.isPending

  const userById = useMemo(() => {
    return new Map(users.map((user) => [normalizeId(user.id), user]))
  }, [users])

  const teamById = useMemo(() => {
    return new Map(teams.map((team) => [normalizeId(team.id || team.team_id), team]))
  }, [teams])

  const tableRows = useMemo(() => {
    return users.map((user, index) => {
      const manager = user.manager || userById.get(normalizeId(user.manager_id))
      const team = user.team || teamById.get(normalizeId(user.team_id))
      const active = Number(user.active ?? 1) === 1

      return {
        ...user,
        _index: index,
        _managerLabel: manager ? getUserLabel(manager) : '',
        _teamLabel: team ? getTeamLabel(team) : '',
        _active: active,
        _activeLabel: active ? 'نشط' : 'غير نشط',
        _createdAtDisplay: formatDate(user.created_at),
        _updatedAtDisplay: formatDate(user.updated_at),
      }
    })
  }, [teamById, userById, users])

  const openCreateDrawer = () => {
    setDrawerMode('create')
    setSelectedUser(null)
    setFormError('')
  }

  const openEditDrawer = (user) => {
    setDrawerMode('edit')
    setSelectedUser(user)
    setFormError('')
  }

  const closeDrawer = () => {
    setDrawerMode(null)
    setSelectedUser(null)
    setFormError('')
  }

  const handleSubmit = async (payload) => {
    setFormError('')

    try {
      if (drawerMode === 'create') {
        await mutations.create.mutateAsync(payload)
      } else if (selectedUser?.id) {
        await mutations.update.mutateAsync({ id: selectedUser.id, payload })
      }
      closeDrawer()
    } catch (error) {
      setFormError(extractMessage(error, 'تعذر حفظ بيانات المستخدم'))
    }
  }

  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'الاسم',
      accessor: 'name',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-36',
      render: (row) => (
        <span className="font-semibold text-[var(--text)]">
          {displayValue(row.name, `User #${row.id || row._index + 1}`)}
        </span>
      ),
    },
    {
      id: 'username',
      header: 'اليوزرنيم',
      accessor: 'username',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-32',
      render: (row) => displayValue(row.username),
    },
    {
      id: 'email',
      header: 'البريد الإلكتروني',
      accessor: 'email',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-48',
      render: (row) => displayValue(row.email),
    },
    {
      id: 'phone',
      header: 'الهاتف',
      accessor: 'phone',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-36',
      render: (row) => displayValue(row.phone),
    },
    {
      id: 'manager',
      header: 'المدير',
      accessor: '_managerLabel',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-36',
      render: (row) => displayValue(row._managerLabel),
    },
    {
      id: 'team',
      header: 'الفريق',
      accessor: '_teamLabel',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-36',
      render: (row) => displayValue(row._teamLabel),
    },
    {
      id: 'role',
      header: 'الدور',
      accessor: 'role',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-28',
      render: (row) => displayValue(row.role),
    },
    {
      id: 'type',
      header: 'النوع',
      accessor: 'type',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-28',
      render: (row) => displayValue(row.type),
    },
    {
      id: 'priority',
      header: 'الأولوية',
      accessor: 'priority',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-24',
      render: (row) => displayValue(row.priority),
    },
    {
      id: 'status',
      header: 'الحالة',
      accessor: '_activeLabel',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-24',
      render: (row) => (
        <Badge variant={row._active ? 'success' : 'danger'}>
          {row._activeLabel}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'تاريخ الإنشاء',
      accessor: '_createdAtDisplay',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-28',
      render: (row) => displayValue(row._createdAtDisplay),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      accessor: 'id',
      searchable: false,
      sortable: false,
      visible: true,
      width: 'w-24',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => openEditDrawer(row)}>
          <Edit3 size={14} />
          تعديل
        </Button>
      ),
    },
  ], [])

  return (
    <div className="space-y-4">
      <PageToolbar
        title="المستخدمين"
        description="إدارة مستخدمي النظام، بيانات الدخول، الربط بالمدير والفريق."
      >
        <Button
          variant="outline"
          onClick={() => {
            usersQuery.refetch()
            teamsQuery.refetch()
          }}
          disabled={usersQuery.isFetching || teamsQuery.isFetching}
        >
          <RefreshCw size={16} className={usersQuery.isFetching || teamsQuery.isFetching ? 'animate-spin' : ''} />
          تحديث
        </Button>
        <Button onClick={openCreateDrawer}>
          <Plus size={16} />
          مستخدم جديد
        </Button>
      </PageToolbar>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="text-xs font-semibold text-[var(--text-muted)]">إجمالي المستخدمين</div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">{users.length}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="text-xs font-semibold text-[var(--text-muted)]">نشط</div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">
            {users.filter((user) => Number(user.active ?? 1) === 1).length}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="text-xs font-semibold text-[var(--text-muted)]">بدون فريق</div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">
            {users.filter((user) => !user.team_id && !user.team?.id).length}
          </div>
        </div>
      </div>

      <DataTable
        data={tableRows}
        columns={columns}
        tableId="users"
        isLoading={usersQuery.isLoading || teamsQuery.isLoading}
        error={usersQuery.error || teamsQuery.error}
        onRetry={() => {
          usersQuery.refetch()
          teamsQuery.refetch()
        }}
        emptyMessage="لا يوجد مستخدمون"
        enableSorting={true}
        enableFiltering={true}
        enablePagination={true}
        enableColumnVisibility={true}
        enableAdvancedFilters={true}
        enableGlobalSearch={true}
        enableExport={true}
        showToolbar={true}
        showFooter={true}
      />

      <UserFormDrawer
        open={isDrawerOpen}
        mode={drawerMode}
        user={selectedUser}
        users={users}
        teams={teams}
        loading={isSaving}
        error={formError}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
