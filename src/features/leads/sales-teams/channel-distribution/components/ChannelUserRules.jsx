import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Users } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { ConfirmDialog } from '../../../../../shared/components/overlays/ConfirmDialog'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { rulesForChannel } from '../utils/channelDistributionModel'
import { useChannelRuleActions } from '../hooks/useChannelRuleActions'
import { ChannelRuleRow } from './ChannelRuleRow'
import { AddChannelRuleDialog } from './AddChannelRuleDialog'

/** The users who receive a channel's chats, grouped by page / number and ordered by priority. */
export function ChannelUserRules({ channel, data, users, identifiers }) {
  const { t } = useTranslation()
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const actions = useChannelRuleActions({ rules: data.rules, mutations: data.mutations })
  const list = rulesForChannel(data.rules, channel)
  const userNames = new Map(users.map((user) => [user.id, user.name]))
  const identifierNames = new Map(identifiers.map((option) => [option.value, option.label]))
  const groups = [...new Set(list.map((rule) => rule.identifier))].sort()
  const nameOf = (rule) => userNames.get(rule.userId) || rule.userName || `#${rule.userId}`
  const labelOf = (identifier) => (identifier ? identifierNames.get(identifier) || identifier : t('salesTeams.channels.identifier.all'))

  return (
    <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-labelledby={`rules-${channel}`}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={`rules-${channel}`} className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
            <Users size={17} className="text-[var(--brand-accent)]" aria-hidden="true" />
            {t('salesTeams.channels.rules.title')}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{t('salesTeams.channels.rules.description')}</p>
        </div>
        <Button variant="accent" onClick={() => setAdding(true)}><Plus size={16} />{t('salesTeams.channels.rules.add')}</Button>
      </header>

      <ResourceState
        isLoading={data.rulesQuery.isLoading}
        error={data.rulesQuery.error}
        empty={list.length === 0}
        emptyIcon={<Users size={22} />}
        emptyTitle={t('salesTeams.channels.rules.emptyTitle')}
        emptyDescription={t('salesTeams.channels.rules.emptyDescription')}
        onRetry={data.rulesQuery.refetch}
      >
        <div className="grid gap-4">
          {groups.map((identifier) => {
            const group = list.filter((rule) => rule.identifier === identifier)
            return (
              <div key={identifier || 'all'} className="grid gap-2">
                <h3 className="text-xs font-semibold text-[var(--text-muted)]">{labelOf(identifier)} · {t('salesTeams.channels.rules.usersCount', { count: group.length })}</h3>
                <ol className="grid gap-1.5">
                  {group.map((rule, index) => (
                    <ChannelRuleRow
                      key={rule.id}
                      rule={rule}
                      rules={data.rules}
                      userName={nameOf(rule)}
                      identifierLabel={labelOf(rule.identifier)}
                      previous={group[index - 1]}
                      next={group[index + 1]}
                      busy={actions.busyId === rule.id}
                      actions={actions}
                      onDelete={setDeleting}
                    />
                  ))}
                </ol>
              </div>
            )
          })}
        </div>
      </ResourceState>

      {adding && (
        <AddChannelRuleDialog
          channel={channel}
          rules={data.rules}
          users={users}
          identifiers={identifiers}
          userNames={userNames}
          mutation={data.mutations.createRule}
          onClose={() => setAdding(false)}
        />
      )}
      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { const rule = deleting; setDeleting(null); await actions.remove(rule) }}
        type="danger"
        title={t('salesTeams.channels.rules.deleteTitle')}
        message={deleting ? t('salesTeams.channels.rules.deleteMessage', { name: nameOf(deleting) }) : ''}
        confirmText={t('salesTeams.channels.rules.delete')}
      />
    </section>
  )
}
