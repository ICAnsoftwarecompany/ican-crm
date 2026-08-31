import { useState } from 'react'
import { Plus, UsersRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'
import { Badge } from '../../shared/components/ui/Badge'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { useTeamMutations, useTeams, useUsers } from '../../features/teams/hooks/useTeams'
import { displayValue, extractMessage } from '../../shared/utils/apiResponse'

const initialForm = {
  name: '',
  team_leader_id: '',
  active: true,
  members: '',
}

export function TeamsPage() {
  const { t } = useTranslation()
  const teamsQuery = useTeams()
  const usersQuery = useUsers()
  const mutations = useTeamMutations()
  const [form, setForm] = useState(initialForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const users = usersQuery.data || []
  const teams = teamsQuery.data || []

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!form.name.trim()) {
      setErrorMessage('اسم الفريق مطلوب')
      return
    }

    const members = form.members
      .split(',')
      .map((id) => Number(id.trim()))
      .filter(Boolean)

    try {
      await mutations.create.mutateAsync({
        name: form.name.trim(),
        team_leader_id: form.team_leader_id || null,
        active: form.active,
        members,
      })
      setForm(initialForm)
      setSuccessMessage('تم إنشاء الفريق')
    } catch (error) {
      setErrorMessage(extractMessage(error, 'فشل إنشاء الفريق'))
    }
  }

  return (
    <div>
      <PageToolbar title={t('nav.teams')} description="إدارة فرق المبيعات وربط الأعضاء بقادة الفرق." />

      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4">
        <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 grid gap-3 h-fit">
          <h2 className="font-bold font-arabic text-[var(--text)]">فريق جديد</h2>
          {errorMessage && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{errorMessage}</div>}
          {successMessage && <div className="rounded-lg bg-emerald-50 text-emerald-700 text-sm p-3">{successMessage}</div>}
          <Input label="اسم الفريق" name="name" value={form.name} onChange={handleChange} />
          <label className="grid gap-1.5 text-sm font-medium font-arabic text-[var(--text)]">
            قائد الفريق
            <select
              name="team_leader_id"
              value={form.team_leader_id}
              onChange={handleChange}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3"
            >
              <option value="">بدون قائد</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username || user.email || `User #${user.id}`}
                </option>
              ))}
            </select>
          </label>
          <Input label="أعضاء الفريق IDs مفصولة بفواصل" name="members" value={form.members} onChange={handleChange} />
          <label className="inline-flex items-center gap-2 text-sm font-arabic">
            <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
            نشط
          </label>
          <Button type="submit" loading={mutations.create.isPending}>
            <Plus size={16} />
            إنشاء الفريق
          </Button>
        </form>

        <ResourceState
          isLoading={teamsQuery.isLoading}
          error={teamsQuery.error}
          empty={teams.length === 0}
          emptyIcon={<UsersRound size={24} />}
          emptyTitle="لا توجد فرق"
          emptyDescription="أنشئ أول فريق مبيعات لبدء توزيع العملاء المحتملين."
          onRetry={teamsQuery.refetch}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {teams.map((team, index) => (
              <article key={team.id || index} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[var(--text)]">{displayValue(team.name, `Team #${team.id || index + 1}`)}</h3>
                    <p className="text-sm text-[var(--text-muted)]">القائد: {displayValue(team.team_leader_name || team.leader_name || team.team_leader_id)}</p>
                  </div>
                  <Badge variant={team.active === false ? 'danger' : 'success'}>{team.active === false ? 'غير نشط' : 'نشط'}</Badge>
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-3">الأعضاء: {displayValue(team.members_count || team.members?.length)}</p>
              </article>
            ))}
          </div>
        </ResourceState>
      </div>
    </div>
  )
}
