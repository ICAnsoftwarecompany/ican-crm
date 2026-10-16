import { useTranslation } from 'react-i18next'
import { MessagesSquare, Plus } from 'lucide-react'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { Button } from '../../../../shared/components/ui/Button'
import { InternalChatWorkspace } from '../../../internal-chat'
import { useDealChatGroups } from './useDealChatGroups'

/**
 * `/deals/:dealId/groups` (2026-10-16): the internal chat (list, thread, members) showing only this deal's groups —
 * named "<deal name> G<n>" — with "New group" creating the next one from the deal's sales team.
 */
export function DealGroupsView() {
  const { t } = useTranslation()
  const { dealName, groups, newGroup } = useDealChatGroups()
  const newButton = (variant = 'outline') => (
    <Button size="sm" variant={variant} onClick={newGroup.open} disabled={!dealName}><Plus size={14} />{t('dealWorkspace.dealGroups.new')}</Button>
  )

  return (
    <div className="space-y-3">
      <ModuleNotice>{t('dealWorkspace.dealGroups.linkNote', { name: dealName })}</ModuleNotice>
      <InternalChatWorkspace
        conversationFilter={groups.filter}
        title={t('dealWorkspace.dealGroups.title', { count: groups.groups.length })}
        headerAction={newButton()}
        emptyList={<EmptyState icon={<MessagesSquare size={24} />} title={t('dealWorkspace.dealGroups.emptyTitle')} description={t('dealWorkspace.dealGroups.emptyDescription', { name: groups.nextName })} action={newButton('primary')} />}
      />
      {newGroup.dialog}
    </div>
  )
}
