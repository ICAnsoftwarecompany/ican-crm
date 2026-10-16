import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { cn } from '../../../../shared/utils/cn'
import { dealInputClass } from '../common/FieldLabel'

/**
 * New internal group of a deal: the name is fixed ("<deal name> G<next>" — how the deal finds its groups), members start
 * with the deal's sales team and can be changed. `create` = useDealGroups().create.
 */
export function NewDealGroupDialog({ open, onClose, name, defaultUserIds = [], users = [], create, onCreated }) {
  const { t } = useTranslation()
  const [picked, setPicked] = useState([])
  const [query, setQuery] = useState('')
  const [showError, setShowError] = useState(false)
  const [touched, setTouched] = useState(false)
  const defaultsKey = defaultUserIds.map(String).join(',')

  useEffect(() => {
    if (!open) return
    setQuery('')
    setShowError(false)
    setTouched(false)
  }, [open])

  // The deal team may load after the dialog opened: take it as long as the user has not changed the selection.
  useEffect(() => {
    if (open && !touched) setPicked(defaultsKey ? defaultsKey.split(',') : [])
  }, [defaultsKey, open, touched])

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()
    return text ? users.filter((user) => `${user.name} ${user.meta || ''}`.toLowerCase().includes(text)) : users
  }, [query, users])
  const toggle = (id) => {
    setTouched(true)
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  const submit = async () => {
    if (!picked.length) {
      setShowError(true)
      return
    }
    try {
      await create.mutateAsync({ name, userIds: picked.map((id) => Number(id) || id) })
      toast.success(t('dealWorkspace.dealGroups.created', { name }))
      onCreated?.()
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.dealGroups.createFailed')))
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      loading={create.isPending}
      title={t('dealWorkspace.dealGroups.newTitle')}
      description={t('dealWorkspace.dealGroups.newDescription')}
      submitText={t('dealWorkspace.dealGroups.create')}
      cancelText={t('dealWorkspace.common.cancel')}
    >
      <div className="space-y-3">
        <div className="rounded-md bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)]">
          {t('dealWorkspace.dealGroups.nameLabel')} <bdi className="font-bold">{name}</bdi>
          <span className="block text-xs text-[var(--text-muted)]">{t('dealWorkspace.dealGroups.nameHint')}</span>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--text)]">{t('dealWorkspace.dealGroups.members', { count: picked.length })}</legend>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
            <input className={`${dealInputClass} ps-8`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('dealWorkspace.wizard.team.search')} aria-label={t('dealWorkspace.wizard.team.search')} />
          </div>
          <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)] p-1">
            {visible.map((user) => {
              const checked = picked.includes(user.id)
              return (
                <li key={user.id}>
                  <label className={cn('flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5', checked ? 'bg-[var(--brand-accent-soft)]' : 'hover:bg-[var(--surface-2)]')}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(user.id)} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-[var(--text)]">{user.name}</span>
                      {user.inTeam && <span className="block text-xs text-[var(--text-muted)]">{t('dealWorkspace.dealGroups.inTeam')}</span>}
                    </span>
                  </label>
                </li>
              )
            })}
            {!visible.length && <li className="p-3 text-center text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.noMatch')}</li>}
          </ul>
          {showError && <p className="text-xs text-red-600 dark:text-red-400">{t('dealWorkspace.dealGroups.membersRequired')}</p>}
        </fieldset>
      </div>
    </FormDialog>
  )
}
