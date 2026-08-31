import { useMemo, useState } from 'react'
import { Edit3, Plus, RefreshCw } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Badge } from '../../../../shared/components/ui/Badge'
import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { DataTable } from '../../../../shared/components/data-table'
import { useTeamMutations, useTeams, useUsers } from '../../../../features/teams/hooks/useTeams'
import { displayValue, extractMessage } from '../../../../shared/utils/apiResponse'
import { TeamDrawer } from './TeamDrawer'
import { TeamMembersDrawer } from './TeamMembersDrawer'

const DEFAULT_FORM = {
  name: '',
  team_leader_id: '',
  active: true,
  members: [],
}

function getUserLabel(user) {
  return user?.name || user?.username || user?.email || `User #${user?.id}`
}

function normalizeId(value) {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

function getTeamLeaderId(team) {
  return normalizeId(team?.team_leader_id || team?.leader_id || team?.leader?.id || team?.team_leader?.id)
}

function getTeamMembers(team) {
  if (Array.isArray(team?._members)) return team._members
  if (Array.isArray(team?.members)) return team.members
  if (Array.isArray(team?.users)) return team.users
  if (Array.isArray(team?.team_members)) return team.team_members
  return []
}

function getTeamMemberIds(team) {
  if (Array.isArray(team?._memberIds)) {
    return team._memberIds.map(normalizeId).filter(Boolean)
  }

  return getTeamMembers(team)
    .map((member) => normalizeId(member?.id || member?.user_id || member))
    .filter(Boolean)
}

function toFormState(team) {
  if (!team) return DEFAULT_FORM

  return {
    name: team.name || '',
    team_leader_id: getTeamLeaderId(team),
    active: Number(team.active ?? 1) === 1,
    members: getTeamMemberIds(team),
  }
}

function getTeamLeaderLabel(team) {
  return (
    team?.team_leader_name ||
    team?.leader_name ||
    team?.leader?.name ||
    team?.team_leader?.name ||
    team?.team_leader_id
  )
}

function addUserTeamLink(map, userId, team) {
  const normalizedUserId = normalizeId(userId)
  if (!normalizedUserId || !team) return

  const teamId = normalizeId(team.id || team.team_id)
  const current = map.get(normalizedUserId) || []

  if (teamId && current.some((item) => normalizeId(item.id || item.team_id) === teamId)) return
  current.push(team)
  map.set(normalizedUserId, current)
}

function createUserTeamMap(users, teams) {
  const result = new Map()
  const teamById = new Map(teams.map((team) => [normalizeId(team.id || team.team_id), team]))

  users.forEach((user) => {
    const userId = normalizeId(user.id)
    if (!userId) return
    result.set(userId, [])

    const directTeamId = normalizeId(user.team_id || user.team?.id || user.team?.team_id)
    if (directTeamId) {
      addUserTeamLink(result, userId, teamById.get(directTeamId) || {
        id: directTeamId,
        name: user.team_name || user.team?.name || `Team #${directTeamId}`,
      })
    }

    if (Array.isArray(user.teams)) {
      user.teams.forEach((team) => addUserTeamLink(result, userId, team))
    }
  })

  teams.forEach((team) => {
    addUserTeamLink(result, getTeamLeaderId(team), team)
    getTeamMemberIds(team).forEach((userId) => addUserTeamLink(result, userId, team))
  })

  return result
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('ar-EG')
}

export function CustomerTeamsPage() {
  const teamsQuery = useTeams()
  const usersQuery = useUsers()
  const mutations = useTeamMutations()
  const [dialogMode, setDialogMode] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedMembersTeam, setSelectedMembersTeam] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [formError, setFormError] = useState('')

  const teams = teamsQuery.data || []
  const users = usersQuery.data || []
  const isDialogOpen = Boolean(dialogMode)
  const isSaving = mutations.create.isPending || mutations.update.isPending || mutations.attach.isPending || mutations.detach.isPending

  const userById = useMemo(() => {
    return new Map(users.map((user) => [normalizeId(user.id), user]))
  }, [users])
  const userTeamsById = useMemo(() => {
    return createUserTeamMap(users, teams)
  }, [users, teams])
  const usersWithoutTeamsCount = useMemo(() => {
    return users.filter((user) => {
      const linkedTeams = userTeamsById.get(normalizeId(user.id)) || []
      return linkedTeams.length === 0
    }).length
  }, [userTeamsById, users])
  const tableRows = useMemo(() => {
    return teams.map((team, index) => {
      const memberIds = getTeamMemberIds(team)
      const members = memberIds.map((id) => userById.get(id)).filter(Boolean)
      const memberLabels = (members.length ? members : memberIds).map((member) => (
        typeof member === 'string' ? `User #${member}` : getUserLabel(member)
      ))
      const active = Number(team.active ?? 1) === 1

      return {
        ...team,
        _index: index,
        _leaderLabel: displayValue(getTeamLeaderLabel(team)),
        _memberIds: memberIds,
        _members: members,
        _membersText: memberLabels.join(', '),
        _membersCount: memberIds.length,
        _active: active,
        _activeLabel: active ? 'نشط' : 'غير نشط',
        _createdAtDisplay: formatDate(team.created_at),
      }
    })
  }, [teams, userById])
  const openCreateDialog = () => {
    setDialogMode('create')
    setSelectedTeam(null)
    setForm(DEFAULT_FORM)
    setFormError('')
  }

  const openEditDialog = (team) => {
    setDialogMode('edit')
    setSelectedTeam(team)
    setForm(toFormState(team))
    setFormError('')
  }

  const openMembersDrawer = (team) => {
    setSelectedMembersTeam(team)
  }

  const closeMembersDrawer = () => {
    setSelectedMembersTeam(null)
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedTeam(null)
    setForm(DEFAULT_FORM)
    setFormError('')
  }

  const updateForm = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value }

      if (key === 'team_leader_id') {
        const leaderId = normalizeId(value)
        next.members = current.members.filter((id) => normalizeId(id) !== leaderId)
      }

      return next
    })
  }

  const toggleMember = (userId) => {
    const value = normalizeId(userId)
    if (!value) return

    setForm((current) => {
      if (value === normalizeId(current.team_leader_id)) return current

      const exists = current.members.includes(value)
      return {
        ...current,
        members: exists
          ? current.members.filter((id) => id !== value)
          : [...current.members, value],
      }
    })
  }

  const syncTeamMembers = async (teamId, previousMembers, nextMembers) => {
    const previous = new Set(previousMembers.map(normalizeId).filter(Boolean))
    const next = new Set(nextMembers.map(normalizeId).filter(Boolean))
    const membersToAttach = [...next].filter((id) => !previous.has(id)).map(Number).filter(Boolean)
    const membersToDetach = [...previous].filter((id) => !next.has(id)).map(Number).filter(Boolean)

    if (membersToAttach.length) {
      await mutations.attach.mutateAsync({ id: teamId, payload: { members: membersToAttach } })
    }

    if (membersToDetach.length) {
      await mutations.detach.mutateAsync({ id: teamId, payload: { members: membersToDetach } })
    }
  }

  const updateSelectedMembersTeam = (nextMemberIds) => {
    setSelectedMembersTeam((current) => {
      if (!current) return current

      const memberIds = nextMemberIds.map(normalizeId).filter(Boolean)
      const members = memberIds.map((id) => userById.get(id) || { id })
      const memberLabels = members.map(getUserLabel)

      return {
        ...current,
        members,
        _members: members,
        _memberIds: memberIds,
        _membersCount: memberIds.length,
        _membersText: memberLabels.join(', '),
      }
    })
  }

  const attachUsersToSelectedTeam = async (userIds) => {
    if (!selectedMembersTeam?.id) return
    const ids = userIds.map(Number).filter(Boolean)
    if (!ids.length) return

    await mutations.attach.mutateAsync({
      id: selectedMembersTeam.id,
      payload: { members: ids },
    })

    const nextIds = new Set(getTeamMemberIds(selectedMembersTeam))
    ids.forEach((id) => nextIds.add(normalizeId(id)))
    updateSelectedMembersTeam([...nextIds])
  }

  const detachUsersFromSelectedTeam = async (userIds) => {
    if (!selectedMembersTeam?.id) return
    const ids = userIds.map(Number).filter(Boolean)
    if (!ids.length) return

    await mutations.detach.mutateAsync({
      id: selectedMembersTeam.id,
      payload: { members: ids },
    })

    const idsToRemove = new Set(ids.map(normalizeId))
    const nextIds = getTeamMemberIds(selectedMembersTeam).filter((id) => !idsToRemove.has(normalizeId(id)))
    updateSelectedMembersTeam(nextIds)
  }

  const handleSubmit = async () => {
    setFormError('')

    if (!form.name.trim()) {
      setFormError('اسم الفريق مطلوب')
      return
    }

    const payload = {
      name: form.name.trim(),
      team_leader_id: form.team_leader_id || null,
      active: form.active ? 1 : 0,
    }
    const memberIds = form.members
      .map(normalizeId)
      .filter((id) => id && id !== normalizeId(form.team_leader_id))

    try {
      if (dialogMode === 'create') {
        await mutations.create.mutateAsync({
          ...payload,
          members: memberIds.map(Number).filter(Boolean),
        })
      } else if (selectedTeam?.id) {
        await mutations.update.mutateAsync({ id: selectedTeam.id, payload })
        await syncTeamMembers(selectedTeam.id, getTeamMemberIds(selectedTeam), memberIds)
      }

      closeDialog()
    } catch (error) {
      setFormError(extractMessage(error, 'تعذر حفظ بيانات الفريق'))
    }
  }

  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'اسم الفريق',
      accessor: 'name',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-40',
      render: (row) => (
        <span className="font-semibold text-[var(--text)]">
          {displayValue(row.name, `Team #${row.id || row._index + 1}`)}
        </span>
      ),
    },
    {
      id: 'leader',
      header: 'قائد الفريق',
      accessor: '_leaderLabel',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-36',
      render: (row) => displayValue(row._leaderLabel),
    },
    {
      id: 'membersCount',
      header: 'عدد الأعضاء',
      accessor: '_membersCount',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-24',
      render: (row) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            openMembersDrawer(row)
          }}
          className="inline-flex"
          title="عرض كل أعضاء الفريق"
        >
          <Badge variant="info" className="cursor-pointer hover:ring-2 hover:ring-[#00C2CB]/30">
            {row._membersCount} عضو
          </Badge>
        </button>
      ),
    },
    {
      id: 'members',
      header: 'الأعضاء',
      accessor: '_membersText',
      searchable: true,
      sortable: false,
      visible: true,
      width: 'w-64',
      render: (row) => (
        row._memberIds.length ? (
          <div className="flex flex-wrap gap-1.5">
            {(row._members.length ? row._members : row._memberIds).slice(0, 6).map((member) => {
              const key = typeof member === 'string' ? member : member.id
              const label = typeof member === 'string' ? `User #${member}` : getUserLabel(member)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openMembersDrawer(row)
                  }}
                  className="inline-flex"
                  title="عرض كل أعضاء الفريق"
                >
                  <Badge variant="info" className="cursor-pointer hover:ring-2 hover:ring-[#00C2CB]/30">
                    {label}
                  </Badge>
                </button>
              )
            })}
            {row._memberIds.length > 6 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  openMembersDrawer(row)
                }}
                className="inline-flex"
                title="عرض باقي الأعضاء"
              >
                <Badge className="cursor-pointer hover:ring-2 hover:ring-[#00C2CB]/30">
                  +{row._memberIds.length - 6}
                </Badge>
              </button>
            )}
          </div>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">لا يوجد أعضاء</span>
        )
      ),
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
        <Button variant="outline" size="sm" onClick={() => openEditDialog(row)}>
          <Edit3 size={14} />
          تعديل
        </Button>
      ),
    },
  ], [])

  return (
    <div className="space-y-4">
      <PageToolbar
        title="فرق السيلز"
        description="إدارة فرق السيلز، تحديد قائد الفريق، وربط المستخدمين بكل فريق."
      >
        <Button variant="outline" onClick={() => teamsQuery.refetch()} disabled={teamsQuery.isFetching}>
          <RefreshCw size={16} className={teamsQuery.isFetching ? 'animate-spin' : ''} />
          تحديث
        </Button>
        <Button onClick={openCreateDialog}>
          <Plus size={16} />
          فريق جديد
        </Button>
      </PageToolbar>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="text-xs font-semibold text-[var(--text-muted)]">إجمالي الفرق</div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">{teams.length}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="text-xs font-semibold text-[var(--text-muted)]">إجمالي المستخدمين</div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">{users.length}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="text-xs font-semibold text-[var(--text-muted)]">مستخدمون بدون فرق</div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">{usersWithoutTeamsCount}</div>
        </div>
      </div>

      <DataTable
        data={tableRows}
        columns={columns}
        tableId="customer-sales-teams"
        isLoading={teamsQuery.isLoading || usersQuery.isLoading}
        error={teamsQuery.error || usersQuery.error}
        onRetry={() => {
          teamsQuery.refetch()
          usersQuery.refetch()
        }}
        emptyMessage="لا توجد فرق - أنشئ أول فريق ثم اربط المستخدمين به"
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

      <TeamMembersDrawer
        open={Boolean(selectedMembersTeam)}
        team={selectedMembersTeam}
        users={users}
        userTeamsById={userTeamsById}
        loading={mutations.attach.isPending || mutations.detach.isPending}
        onClose={closeMembersDrawer}
        onAttachUsers={attachUsersToSelectedTeam}
        onDetachUsers={detachUsersFromSelectedTeam}
      />

      <TeamDrawer
        open={isDialogOpen}
        mode={dialogMode}
        form={form}
        users={users}
        userTeamsById={userTeamsById}
        error={formError}
        loading={isSaving}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        onChange={updateForm}
        onToggleMember={toggleMember}
      />
    </div>
  )
}
