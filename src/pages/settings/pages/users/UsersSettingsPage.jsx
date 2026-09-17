import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Badge } from '../../../../shared/components/ui/Badge'
import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { useUsers } from '../../../../features/teams/hooks/useTeams'
import { usersApi } from '../../../../features/users/api/usersApi'
import { displayValue, extractMessage } from '../../../../shared/utils/apiResponse'

export function UsersSettingsPage() {
  const [userForm, setUserForm] = useState({ name: '', email: '', username: '', phone: '', role: 'sales', password: '' })
  const [feedback, setFeedback] = useState('')
  const usersQuery = useUsers()
  const queryClient = useQueryClient()
  const createUser = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const handleCreateUser = async (event) => {
    event.preventDefault()
    setFeedback('')
    try {
      await createUser.mutateAsync(userForm)
      setUserForm({ name: '', email: '', username: '', phone: '', role: 'sales', password: '' })
      setFeedback('تم إنشاء المستخدم')
    } catch (error) {
      setFeedback(extractMessage(error, 'فشل إنشاء المستخدم'))
    }
  }

  return (
    <div>
      <PageToolbar title="المستخدمون" description="إدارة مستخدمي النظام وصلاحياتهم." />

      {feedback && <div className="mb-4 rounded-lg bg-[#E8F9FA] text-[#007A80] text-sm p-3">{feedback}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4">
        <form onSubmit={handleCreateUser} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 grid gap-3 h-fit">
          <h2 className="font-bold">مستخدم جديد</h2>
          {Object.keys(userForm).map((field) => (
            <Input
              key={field}
              label={field}
              type={field === 'password' ? 'password' : 'text'}
              value={userForm[field]}
              onChange={(event) => setUserForm((current) => ({ ...current, [field]: event.target.value }))}
            />
          ))}
          <Button type="submit" loading={createUser.isPending}>
            <UserPlus size={16} />
            إنشاء مستخدم
          </Button>
        </form>
        <ResourceState isLoading={usersQuery.isLoading} error={usersQuery.error} empty={(usersQuery.data || []).length === 0} emptyTitle="لا توجد مستخدمون" onRetry={usersQuery.refetch}>
          <div className="grid gap-3">
            {(usersQuery.data || []).map((user, index) => (
              <article key={user.id || index} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
                <h3 className="font-bold">{displayValue(user.name || user.username, `User #${user.id || index + 1}`)}</h3>
                <p className="text-sm text-[var(--text-muted)]">{displayValue(user.email)} • {displayValue(user.phone)}</p>
                <Badge>{displayValue(user.role)}</Badge>
              </article>
            ))}
          </div>
        </ResourceState>
      </div>
    </div>
  )
}
