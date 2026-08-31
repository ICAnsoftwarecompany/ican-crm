import { useState } from 'react'
import { Plus, Settings, Tags, UserPlus, Workflow } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'
import { Badge } from '../../shared/components/ui/Badge'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { useDefinitionMutations, useStatuses, useTags } from '../../features/definitions/hooks/useDefinitions'
import { useUsers } from '../../features/teams/hooks/useTeams'
import { usersApi } from '../../features/users/api/usersApi'
import { useIntegrations } from '../../features/integrations/hooks/useIntegrations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { displayValue, extractMessage } from '../../shared/utils/apiResponse'

export function SettingsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('definitions')
  const [statusForm, setStatusForm] = useState({ status: '', type: 'lead', active: '1' })
  const [tagForm, setTagForm] = useState({ tag: '', type: 'lead', active: '1' })
  const [userForm, setUserForm] = useState({ name: '', email: '', username: '', phone: '', role: 'sales', password: '' })
  const [feedback, setFeedback] = useState('')
  const statusesQuery = useStatuses()
  const tagsQuery = useTags()
  const usersQuery = useUsers()
  const integrationsQuery = useIntegrations()
  const definitions = useDefinitionMutations()
  const queryClient = useQueryClient()
  const createUser = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const handleCreateStatus = async (event) => {
    event.preventDefault()
    setFeedback('')
    try {
      await definitions.createStatus.mutateAsync(statusForm)
      setStatusForm({ status: '', type: 'lead', active: '1' })
      setFeedback('تم حفظ الحالة')
    } catch (error) {
      setFeedback(extractMessage(error, 'فشل حفظ الحالة'))
    }
  }

  const handleCreateTag = async (event) => {
    event.preventDefault()
    setFeedback('')
    try {
      await definitions.createTag.mutateAsync(tagForm)
      setTagForm({ tag: '', type: 'lead', active: '1' })
      setFeedback('تم حفظ الوسم')
    } catch (error) {
      setFeedback(extractMessage(error, 'فشل حفظ الوسم'))
    }
  }

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
      <PageToolbar title={t('nav.settings')} description="تعريفات النظام، المستخدمون، والتكاملات." />

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ['definitions', 'التعريفات', Tags],
          ['users', 'المستخدمون', UserPlus],
          ['integrations', 'التكاملات', Workflow],
        ].map(([key, label, Icon]) => (
          <Button key={key} variant={tab === key ? 'primary' : 'outline'} onClick={() => setTab(key)}>
            <Icon size={16} />
            {label}
          </Button>
        ))}
      </div>

      {feedback && <div className="mb-4 rounded-lg bg-[#E8F9FA] text-[#007A80] text-sm p-3">{feedback}</div>}

      {tab === 'definitions' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <form onSubmit={handleCreateStatus} className="grid gap-3 mb-4">
              <h2 className="font-bold">الحالات</h2>
              <Input label="اسم الحالة" value={statusForm.status} onChange={(event) => setStatusForm((current) => ({ ...current, status: event.target.value }))} />
              <Input label="النوع" value={statusForm.type} onChange={(event) => setStatusForm((current) => ({ ...current, type: event.target.value }))} />
              <Button type="submit" loading={definitions.createStatus.isPending}>
                <Plus size={16} />
                إضافة حالة
              </Button>
            </form>
            <ResourceState isLoading={statusesQuery.isLoading} error={statusesQuery.error} empty={(statusesQuery.data || []).length === 0} emptyTitle="لا توجد حالات" onRetry={statusesQuery.refetch}>
              <div className="flex flex-wrap gap-2">
                {(statusesQuery.data || []).map((status, index) => (
                  <Badge key={status.id || index}>{displayValue(status.status || status.name)}</Badge>
                ))}
              </div>
            </ResourceState>
          </section>

          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <form onSubmit={handleCreateTag} className="grid gap-3 mb-4">
              <h2 className="font-bold">الوسوم</h2>
              <Input label="اسم الوسم" value={tagForm.tag} onChange={(event) => setTagForm((current) => ({ ...current, tag: event.target.value }))} />
              <Input label="النوع" value={tagForm.type} onChange={(event) => setTagForm((current) => ({ ...current, type: event.target.value }))} />
              <Button type="submit" variant="accent" loading={definitions.createTag.isPending}>
                <Plus size={16} />
                إضافة وسم
              </Button>
            </form>
            <ResourceState isLoading={tagsQuery.isLoading} error={tagsQuery.error} empty={(tagsQuery.data || []).length === 0} emptyTitle="لا توجد وسوم" onRetry={tagsQuery.refetch}>
              <div className="flex flex-wrap gap-2">
                {(tagsQuery.data || []).map((tag, index) => (
                  <Badge key={tag.id || index} variant="ai">{displayValue(tag.tag || tag.name)}</Badge>
                ))}
              </div>
            </ResourceState>
          </section>
        </div>
      )}

      {tab === 'users' && (
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
      )}

      {tab === 'integrations' && (
        <ResourceState
          isLoading={integrationsQuery.isLoading}
          error={integrationsQuery.error}
          empty={(integrationsQuery.data || []).length === 0}
          emptyIcon={<Settings size={24} />}
          emptyTitle="لا توجد تكاملات"
          emptyDescription="عند تفعيل Meta أو WhatsApp ستظهر بيانات التكامل هنا."
          onRetry={integrationsQuery.refetch}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {(integrationsQuery.data || []).map((integration, index) => (
              <article key={integration.id || index} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
                <h3 className="font-bold">{displayValue(integration.name || integration.provider, `Integration #${integration.id || index + 1}`)}</h3>
                <p className="text-sm text-[var(--text-muted)]">{displayValue(integration.type || integration.status)}</p>
                <Badge variant={integration.active === false ? 'danger' : 'success'}>{integration.active === false ? 'غير نشط' : 'نشط'}</Badge>
              </article>
            ))}
          </div>
        </ResourceState>
      )}
    </div>
  )
}
