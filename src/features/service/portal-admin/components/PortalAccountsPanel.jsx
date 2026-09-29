import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { LogOut, MailPlus, Plus, Search, UserPlus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { usePortalAccounts, usePortalAdminMutations } from '../api/portalAdminApi'
import { AddMembershipDialog, InvitePortalAccountDialog } from './PortalAccountDialogs'

const STATUS_TONE = { active: 'text-sla-on-track', invited: 'text-sla-at-risk', disabled: 'text-status-lost' }

/**
 * Portal accounts & memberships (spec §43.1). Used in Operations settings (all accounts) and can be embedded for one
 * customer with `customer`.
 */
export function PortalAccountsPanel({ customer, resource }) {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [inviting, setInviting] = useState(false)
  const [adding, setAdding] = useState(null)
  const debounced = useDebounce(search, 300)
  const accounts = usePortalAccounts({ search: debounced || undefined, customer_id: customer?.id })
  const { setStatus, revokeMembership, revokeSessions, resendInvite } = usePortalAdminMutations()
  const done = (key) => ({ onSuccess: () => toast.success(t(`service.portal.done.${key}`)) })

  return (
    <div className="grid gap-4">
      {resource && (
        <header className="grid gap-1">
          <h2 className="text-lg font-bold text-[var(--text)]">{t(`${resource.i18nKey}.title`)}</h2>
          <p className="text-sm text-[var(--text-muted)]">{t(`${resource.i18nKey}.description`)}</p>
        </header>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('service.portal.searchAccounts')} aria-label={t('service.portal.searchAccounts')} startIcon={<Search size={16} aria-hidden="true" />} />
        </div>
        <Button onClick={() => setInviting(true)}><UserPlus size={16} aria-hidden="true" />{t('service.portal.invite')}</Button>
      </div>
      <ResourceState isLoading={accounts.isLoading} error={accounts.error} onRetry={accounts.refetch} empty={!accounts.data?.length} emptyTitle={t('service.portal.noAccounts')}>
        <ul className="grid gap-3">
          {(accounts.data || []).map((account) => (
            <li key={account.id} className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid gap-0.5">
                  <span className="font-medium text-[var(--text)]">{account.name}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {[account.phone, account.email].filter(Boolean).map((contact) => <span key={contact} dir="ltr" className="me-2 inline-block">{contact}</span>)}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    <span className={cn('font-medium', STATUS_TONE[account.status])}>{t(`service.portal.accountStatuses.${account.status}`)}</span>
                    {' · '}
                    {account.last_login_at ? t('service.portal.lastLogin', { when: formatRelativeTime(account.last_login_at, i18n.language) }) : t('service.portal.neverLoggedIn')}
                    {' · '}
                    {t('service.portal.sessions', { count: account.active_sessions || 0 })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {account.status === 'invited' && <Button size="sm" variant="outline" onClick={() => resendInvite.mutate(account.id, done('inviteSent'))}><MailPlus size={14} aria-hidden="true" />{t('service.portal.resendInvite')}</Button>}
                  <Button size="sm" variant="outline" onClick={() => setAdding(account)}><Plus size={14} aria-hidden="true" />{t('service.portal.addMembership')}</Button>
                  {account.active_sessions > 0 && <Button size="sm" variant="outline" onClick={() => revokeSessions.mutate(account.id, done('sessionsRevoked'))}><LogOut size={14} aria-hidden="true" />{t('service.portal.revokeSessions')}</Button>}
                  <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: account.id, status: account.status === 'disabled' ? 'active' : 'disabled' }, done(account.status === 'disabled' ? 'enabled' : 'disabled'))}>
                    {t(account.status === 'disabled' ? 'service.portal.enable' : 'service.portal.disable')}
                  </Button>
                </div>
              </div>
              <ul className="flex flex-wrap gap-2">
                {account.memberships.filter((membership) => membership.status === 'active').map((membership) => (
                  <li key={membership.id} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] py-1 pe-1 ps-3 text-xs text-[var(--text)]">
                    <span>
                      <span className="font-medium">{membership.customer?.name}</span>
                      {' · '}
                      {t(`service.portal.membershipTypes.${membership.membership_type}`)}
                      {membership.role_id ? ` · ${t(`service.portal.roles.${membership.role_id}`)}` : ''}
                      {membership.policy ? ` · ${localizeLabel(membership.policy.name, i18n.language, membership.policy.id)}` : ''}
                    </span>
                    <button type="button" className="rounded-full px-2 py-0.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-status-lost" aria-label={t('service.portal.revokeMembership')} title={t('service.portal.revokeMembership')} onClick={() => revokeMembership.mutate({ id: account.id, membershipId: membership.id }, done('membershipRevoked'))}>
                      {t('service.portal.revoke')}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </ResourceState>
      <InvitePortalAccountDialog open={inviting} onClose={() => setInviting(false)} customer={customer} />
      <AddMembershipDialog account={adding} onClose={() => setAdding(null)} />
    </div>
  )
}
