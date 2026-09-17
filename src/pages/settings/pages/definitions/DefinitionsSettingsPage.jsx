import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Badge } from '../../../../shared/components/ui/Badge'
import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { useDefinitionMutations, useStatuses, useTags } from '../../../../features/definitions/hooks/useDefinitions'
import { displayValue, extractMessage } from '../../../../shared/utils/apiResponse'

export function DefinitionsSettingsPage() {
  const [statusForm, setStatusForm] = useState({ status: '', type: 'lead', active: '1' })
  const [tagForm, setTagForm] = useState({ tag: '', type: 'lead', active: '1' })
  const [feedback, setFeedback] = useState('')
  const statusesQuery = useStatuses()
  const tagsQuery = useTags()
  const definitions = useDefinitionMutations()

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

  return (
    <div>
      <PageToolbar title="التعريفات" description="إدارة حالات ووسوم العملاء المستخدمة في النظام." />

      {feedback && <div className="mb-4 rounded-lg bg-[#E8F9FA] text-[#007A80] text-sm p-3">{feedback}</div>}

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
    </div>
  )
}
