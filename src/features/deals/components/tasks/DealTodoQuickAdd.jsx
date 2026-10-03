import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { buildTodoPayload, useCurrentUserId, useTaskMutations } from '../../../tasks'
import { dealInputClass } from '../common/FieldLabel'

const WHEN = ['today', 'tomorrow', 'week', 'month']

/** Quick To-Do linked to the deal (task `type: todo` + period, taskable = Deal). Same model as /todo. */
export function DealTodoQuickAdd({ dealId }) {
  const { t } = useTranslation()
  const currentUserId = useCurrentUserId()
  const { create } = useTaskMutations()
  const [title, setTitle] = useState('')
  const [when, setWhen] = useState('today')

  const submit = async (event) => {
    event.preventDefault()
    if (!title.trim()) return
    try {
      await create.mutateAsync(buildTodoPayload({ title: title.trim(), when, taskable_type: 'deal', taskable_id: dealId }, { currentUserId }))
      toast.success(t('dealWorkspace.tasks.todoAdded'))
      setTitle('')
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.tasks.todoFailed')))
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
      <input className={`${dealInputClass} min-w-[200px] flex-1`} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('dealWorkspace.tasks.todoPlaceholder')} aria-label={t('dealWorkspace.tasks.todoPlaceholder')} />
      <select className={`${dealInputClass} w-auto`} value={when} onChange={(event) => setWhen(event.target.value)} aria-label={t('dealWorkspace.tasks.when')}>
        {WHEN.map((value) => <option key={value} value={value}>{t(`dealWorkspace.tasks.whenOptions.${value}`)}</option>)}
      </select>
      <Button type="submit" size="sm" loading={create.isPending} disabled={!title.trim() || create.isPending}><Plus size={14} />{t('dealWorkspace.tasks.addTodo')}</Button>
    </form>
  )
}
