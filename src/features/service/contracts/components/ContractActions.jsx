import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { useContractMutations } from '../api/contractsApi'

/** Which lifecycle actions a status offers (the server re-validates every one). */
export const CONTRACT_ACTIONS = {
  draft: ['send', 'cancel'],
  sent: ['sign', 'cancel'],
  partially_signed: ['sign'],
  signed: ['activate', 'terminate'],
  active: ['renew', 'terminate'],
  expiring: ['renew', 'terminate'],
  expired: ['renew'],
}

/** Header buttons for the contract lifecycle; sign/terminate collect details in a dialog. */
export function ContractActions({ contract, detailPath }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { action } = useContractMutations(contract.id)
  const [dialog, setDialog] = useState(null)
  const [form, setForm] = useState({})
  const actions = CONTRACT_ACTIONS[contract.status] || []
  const signedParties = new Set((contract.signatures || []).filter((entry) => entry.version === contract.effective_version).map((entry) => entry.signer_type))

  const run = (name, payload = {}) =>
    action.mutate(
      { id: contract.id, action: name, version: contract.version, ...payload },
      {
        onSuccess: (result) => {
          toast.success(t(`service.contracts.done.${name}`))
          setDialog(null)
          if (name === 'renew' && detailPath) navigate(detailPath(result))
        },
      }
    )
  const open = (name) => {
    if (name === 'sign') setForm({ signer_type: signedParties.has('customer') ? 'company' : 'customer', signer_name: signedParties.has('customer') ? '' : contract.customer?.name || '', method: 'e_sign' })
    else setForm({ reason: '' })
    setDialog(name)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((name) => (
        <Button key={name} variant={name === 'cancel' || name === 'terminate' ? 'outline' : 'primary'} loading={action.isPending && action.variables?.action === name} onClick={() => (['sign', 'terminate'].includes(name) ? open(name) : run(name))}>
          {t(`service.contracts.actions.${name}`)}
        </Button>
      ))}
      <FormDialog open={dialog === 'sign'} onClose={() => setDialog(null)} title={t('service.contracts.actions.sign')} description={t('service.contracts.signDescription', { version: contract.effective_version })} submitText={t('service.contracts.actions.sign')} submitDisabled={!form.signer_name?.trim()} loading={action.isPending} onSubmit={() => run('sign', form)}>
        <Select label={t('service.contracts.signer')} value={form.signer_type} onChange={(signer_type) => setForm((current) => ({ ...current, signer_type }))} options={['customer', 'company'].filter((value) => !signedParties.has(value)).map((value) => ({ value, label: t(`service.contracts.parties.${value}`) }))} />
        <Input label={t('service.contracts.signerName')} dir="auto" value={form.signer_name || ''} onChange={(event) => setForm((current) => ({ ...current, signer_name: event.target.value }))} />
        <Select label={t('service.contracts.method')} value={form.method} onChange={(method) => setForm((current) => ({ ...current, method: method || 'e_sign' }))} options={['e_sign', 'otp', 'wet_ink'].map((value) => ({ value, label: t(`service.contracts.methods.${value}`) }))} />
      </FormDialog>
      <FormDialog open={dialog === 'terminate'} onClose={() => setDialog(null)} title={t('service.contracts.actions.terminate')} description={t('service.contracts.terminateDescription')} submitText={t('service.contracts.actions.terminate')} submitDisabled={!form.reason?.trim()} loading={action.isPending} onSubmit={() => run('terminate', { reason: form.reason })}>
        <Input label={t('service.entitlements.reason')} dir="auto" value={form.reason || ''} onChange={(event) => setForm({ reason: event.target.value })} />
      </FormDialog>
    </div>
  )
}
