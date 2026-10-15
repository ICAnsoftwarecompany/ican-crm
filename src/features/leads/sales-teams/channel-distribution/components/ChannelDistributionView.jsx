import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessagesSquare } from 'lucide-react'
import { ModuleNotice, ModulePageHeader } from '../../../../../shared/components/module-pages'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { cn } from '../../../../../shared/utils/cn'
import { useUsers } from '../../../../users'
// Direct path: the meta-integrations index re-exports a commented-out messengerMetaApi and fails to load.
import { useFacebookIntegrations } from '../../../../meta-integrations/hooks/useFacebookIntegrations'
import { useAuthStore } from '../../../../../store/authStore'
import { resolveTenantId } from '../../../../../services/tenantResolver'
import { normalizeSalesUser, sortByPriority, isSalesUser } from '../../sales-users/utils/salesUsersModel'
import { useChannelDistribution } from '../hooks/useChannelDistribution'
import { CHANNELS, identifierOptions, rulesForChannel, settingForChannel } from '../utils/channelDistributionModel'
import { ChannelSettingsCard } from './ChannelSettingsCard'
import { ChannelUserRules } from './ChannelUserRules'

/**
 * /LeadsCenter/teams/channels — who receives new chats per channel: the channel's strategy (settings) and the
 * ordered users (assignment rules). WhatsApp and Messenger are live; the other channels are shown as coming soon.
 */
export function ChannelDistributionView() {
  const { t } = useTranslation()
  const [channel, setChannel] = useState('whatsapp')
  const data = useChannelDistribution()
  const usersQuery = useUsers()
  const tenantId = resolveTenantId(useAuthStore((state) => state.user))
  const integrations = useFacebookIntegrations(tenantId)
  const users = useMemo(() => {
    const list = sortByPriority((usersQuery.data || []).map(normalizeSalesUser))
    return [...list.filter(isSalesUser), ...list.filter((user) => !isSalesUser(user))]
  }, [usersQuery.data])
  const identifiers = identifierOptions(integrations.data, channel)
  const setting = settingForChannel(data.settings, channel)

  return (
    <div className="space-y-4">
      <ModulePageHeader icon={MessagesSquare} title={t('salesTeams.channels.title')} description={t('salesTeams.channels.description')} />
      <ModuleNotice>{t('salesTeams.channels.howItWorks')}</ModuleNotice>

      <div role="tablist" aria-label={t('salesTeams.channels.tabsLabel')} className="flex flex-wrap gap-2">
        {CHANNELS.map(({ id, live }) => {
          const count = rulesForChannel(data.rules, id).length
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={channel === id}
              disabled={!live}
              onClick={() => setChannel(id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                channel === id ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--text)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
                !live && 'cursor-not-allowed opacity-60'
              )}
            >
              {t(`salesTeams.channels.names.${id}`)}
              {live ? <span className="rounded bg-[var(--surface-2)] px-1.5 text-xs">{count}</span> : <span className="text-xs font-normal">{t('salesTeams.channels.soon')}</span>}
            </button>
          )
        })}
      </div>

      <ResourceState isLoading={data.settingsQuery.isLoading} error={data.settingsQuery.error} onRetry={data.settingsQuery.refetch}>
        <ChannelSettingsCard key={`${channel}-${setting?.id || 'new'}`} channel={channel} setting={setting} mutations={data.mutations} />
      </ResourceState>
      <ChannelUserRules channel={channel} data={data} users={users} identifiers={identifiers} />
    </div>
  )
}
