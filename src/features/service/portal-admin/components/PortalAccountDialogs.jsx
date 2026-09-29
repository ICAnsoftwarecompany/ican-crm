import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { usePortalAdminMutations } from '../api/portalAdminApi'
import { MembershipFields } from './MembershipFields'

const EMPTY_MEMBERSHIP = { customer_id: '', membership_type: 'self', role_id: '', policy_id: '' }

/** Invite a person to the portal (they sign in with OTP on first use). */
export function InvitePortalAccountDialog({ open, onClose, customer }) {
  const { t } = useTranslation()
  const { invite } = usePortalAdminMutations()
  const [form, setForm] = useState({})
  const [membership, setMembership] = useState(EMPTY_MEMBERSHIP)
  const errors = getServiceFieldErrors(invite.error)
  useEffect(() => {
    if (open) {
      setForm({ name: '', phone: '', email: '' })
      setMembership({ ...EMPTY_MEMBERSHIP, customer_id: customer?.id || '' })
      invite.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const submit = () =>
    invite.mutate({ ...form, phone: form.phone || undefined, email: form.email || undefined, ...membership, role_id: membership.role_id || undefined }, {
      onSuccess: () => {
        toast.success(t('service.portal.done.invited'))
        onClose()
      },
    })
  return (
    <FormDialog open={open} onClose={onClose} size="lg" className="max-w-2xl" title={t('service.portal.invite')} description={t('service.portal.inviteDescription')} submitText={t('service.portal.invite')} loading={invite.isPending} onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input label={t('service.portal.fields.name')} dir="auto" value={form.name || ''} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} error={errors.name && t('service.settings.validation.required')} />
        <Input label={t('service.portal.fields.phone')} dir="ltr" value={form.phone || ''} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} error={errors.phone && t('service.portal.validation.phoneOrEmail')} />
        <Input label={t('service.portal.fields.email')} dir="ltr" type="email" value={form.email || ''} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
      </div>
      <MembershipFields value={membership} onChange={setMembership} errors={errors} fixedCustomer={customer} />
    </FormDialog>
  )
}

/** Give an existing account access to another customer (e.g. a guardian with two families, a B2B user of two companies). */
export function AddMembershipDialog({ account, onClose }) {
  const { t } = useTranslation()
  const { addMembership } = usePortalAdminMutations()
  const [membership, setMembership] = useState(EMPTY_MEMBERSHIP)
  const errors = getServiceFieldErrors(addMembership.error)
  useEffect(() => {
    if (account) {
      setMembership(EMPTY_MEMBERSHIP)
      addMembership.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id])
  return (
    <FormDialog open={Boolean(account)} onClose={onClose} size="lg" className="max-w-2xl" title={t('service.portal.addMembership')} description={account?.name} submitText={t('service.portal.addMembership')} loading={addMembership.isPending} onSubmit={() => addMembership.mutate({ id: account.id, ...membership, role_id: membership.role_id || undefined }, { onSuccess: () => { toast.success(t('service.portal.done.membershipAdded')); onClose() } })}>
      <MembershipFields value={membership} onChange={setMembership} errors={errors} />
    </FormDialog>
  )
}
