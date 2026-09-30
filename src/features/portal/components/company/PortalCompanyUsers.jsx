import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { portalApi, usePortalList, usePortalMutation } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { usePortalFormat } from '../../utils/format'
import { Card, PortalPage, StatusPill } from '../PortalPage'

const ROLES = ['admin', 'operations', 'warehouse', 'customer_service', 'accounting']

/** B2B admin: the company's portal users (invite, change role, suspend) — within the roles the tenant mapped to policies. */
export function PortalCompanyUsers() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const { can } = usePortalAccess()
  const manage = can('org_users', 'manage')
  const query = usePortalList('org-users', P.orgUsers)
  const [inviting, setInviting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role_id: 'operations' })
  const invite = usePortalMutation(() => portalApi.post(P.orgUsers, form), { onSuccess: () => { toast.success(t('portal.company.invited')); setInviting(false) } })
  const update = usePortalMutation(({ id, ...payload }) => portalApi.patch(`${P.orgUsers}/${id}`, payload), { onSuccess: () => toast.success(t('portal.company.updated')) })
  const errors = invite.error?.response?.data?.errors || {}
  const users = query.data || []

  return (
    <PortalPage title={t('portal.sections.company')} description={t('portal.company.description')} actions={manage && <Button onClick={() => { setForm({ name: '', email: '', role_id: 'operations' }); invite.reset(); setInviting(true) }}><UserPlus size={16} aria-hidden="true" />{t('portal.company.invite')}</Button>} query={query} empty={!users.length} emptyTitle={t('portal.company.empty')}>
      <Card>
        <ul className="divide-y divide-[var(--border)]">
          {users.map((user) => (
            <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span className="grid">
                <span className="font-medium">{user.name}{user.is_me && <span className="text-xs text-[var(--text-muted)]"> · {t('portal.company.you')}</span>}</span>
                <span dir="ltr" className="text-start text-xs text-[var(--text-muted)]">{user.email || user.phone}</span>
                <span className="text-xs text-[var(--text-muted)]">{user.last_login_at ? t('portal.company.lastLogin', { date: format.date(user.last_login_at) }) : t('portal.company.neverLoggedIn')}</span>
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <StatusPill tone={user.status === 'active' ? 'ok' : user.status === 'invited' ? 'warn' : 'bad'}>{t(`portal.company.statuses.${user.status}`)}</StatusPill>
                {manage && !user.is_me ? (
                  <>
                    <div className="w-40"><Select aria-label={t('portal.company.role')} value={user.role_id} onChange={(role) => role && role !== user.role_id && update.mutate({ id: user.id, role_id: role })} options={ROLES.map((role) => ({ value: role, label: t(`portal.roles.${role}`) }))} /></div>
                    <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: user.id, status: user.status === 'suspended' ? 'active' : 'suspended' })}>{t(user.status === 'suspended' ? 'portal.company.reactivate' : 'portal.company.suspend')}</Button>
                  </>
                ) : (
                  <span className="text-xs">{t(`portal.roles.${user.role_id}`)}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <FormDialog open={inviting} onClose={() => setInviting(false)} title={t('portal.company.invite')} description={t('portal.company.inviteHint')} submitText={t('portal.company.invite')} loading={invite.isPending} onSubmit={() => invite.mutate()}>
        <Input label={t('portal.company.name')} dir="auto" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} error={errors.name && t('portal.errors.required')} />
        <Input label={t('portal.auth.email')} type="email" dir="ltr" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} error={errors.email && t('portal.errors.required')} />
        <Select label={t('portal.company.role')} value={form.role_id} onChange={(role) => setForm((current) => ({ ...current, role_id: role }))} options={ROLES.map((role) => ({ value: role, label: t(`portal.roles.${role}`) }))} error={errors.role_id && t('portal.company.roleNotAllowed')} />
      </FormDialog>
    </PortalPage>
  )
}
