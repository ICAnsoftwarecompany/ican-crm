import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { InternalChatWorkspace, chatKeys, getAllChatConversations } from '../../internal-chat'
import { ResourceState } from '../../../shared/components/data/ResourceState'
import { Button } from '../../../shared/components/ui/Button'
import { useDealWorkspace } from '../hooks/useDealWorkspace'
import { useDealTeam } from '../hooks/useDealResources'
import { createDealChat, dealGroupNumber, resolveWizardChatUsers } from '../utils/dealChat'

export function DealChatWorkspace() {
  const { t } = useTranslation()
  const { deal, dealId } = useDealWorkspace()
  const client = useQueryClient()
  const teamQuery = useDealTeam(dealId)
  const members = teamQuery.members
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const query = useQuery({ queryKey: [...chatKeys.conversations(), 'deal-groups', String(dealId)], queryFn: getAllChatConversations })
  const groups = useMemo(() => (query.data || []).filter((item) => dealGroupNumber(item, deal.name)), [query.data, deal.name])
  const create = async () => {
    setPending(true)
    setError('')
    try {
      const userIds = await resolveWizardChatUsers({ basics: {}, team: { members, addOwner: false } })
      await createDealChat(deal.name, userIds)
      await client.invalidateQueries({ queryKey: chatKeys.all })
    } catch (failure) {
      setError(failure.message?.startsWith('dealWorkspace.') ? t(failure.message, { name: failure.teamName }) : failure.response?.data?.message || t('dealWorkspace.pipeline.chatFailed'))
    } finally { setPending(false) }
  }
  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-[var(--text)]">{t('dealWorkspace.pipeline.chats')}</h2>
        <Button size="sm" onClick={create} disabled={pending || query.isLoading || Boolean(query.error) || teamQuery.isLoading || Boolean(teamQuery.error) || !members.length}>
          <Plus size={15} />{t(pending ? 'dealWorkspace.pipeline.chatCreating' : 'dealWorkspace.pipeline.createChat')}
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch}>
        {!groups.length && <p className="text-sm text-[var(--text-muted)]">{t('dealWorkspace.pipeline.noChats')}</p>}
        <InternalChatWorkspace key={dealId} scopeKey={String(dealId)} conversations={groups} />
      </ResourceState>
    </div>
  )
}
