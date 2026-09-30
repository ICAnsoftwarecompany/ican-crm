import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { useCaseSetup } from '../../cases/hooks/useCases'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { CustomerSelect } from '../../records/components/CustomerSelect'
import { useResourceList } from '../../settings/api/settingsApi'
import { followUpProgramsResource } from '../../settings/resources/followUpResources'
import { offsetToForm } from '../constants/followUps'
import { useFollowUpMutations } from '../api/followUpsApi'

const EMPTY = { program_id: '', customer_id: '', subject_ends_at: '', owner_id: '' }

/** Manual enrollment (spec §39.2 `enrollment_trigger: manual`); event-triggered programs enroll on the server. */
export function EnrollFollowUpDialog({ open, onClose, customer }) {
  const { t, i18n } = useTranslation()
  const programs = useResourceList(followUpProgramsResource)
  const setup = useCaseSetup()
  const { enroll } = useFollowUpMutations()
  const [form, setForm] = useState(EMPTY)
  const errors = getServiceFieldErrors(enroll.error)
  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY, customer_id: customer?.id || '' })
      enroll.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))
  const program = (programs.data || []).find((entry) => entry.id === form.program_id)
  const needsEnd = program && offsetToForm(program.steps?.[0]?.offset).direction === 'before_end'
  const submit = () =>
    enroll.mutate({ program_id: form.program_id, customer_id: form.customer_id, owner_id: form.owner_id || undefined, subject_ends_at: needsEnd ? form.subject_ends_at || undefined : undefined }, {
      onSuccess: () => {
        toast.success(t('service.followUps.done.enrolled'))
        onClose()
      },
    })
  const required = (name) => errors[name] && t('service.settings.validation.required')
  return (
    <FormDialog open={open} onClose={onClose} size="lg" className="max-w-xl" title={t('service.followUps.enroll')} description={t('service.followUps.enrollDescription')} submitText={t('service.followUps.enroll')} loading={enroll.isPending} onSubmit={submit}>
      <Select label={t('service.followUps.columns.program')} value={form.program_id} onChange={set('program_id')} error={required('program_id')} options={(programs.data || []).filter((entry) => entry.status !== 'inactive').map((entry) => ({ value: entry.id, label: localizeLabel(entry.name, i18n.language, entry.id) }))} />
      <CustomerSelect value={form.customer_id} onChange={set('customer_id')} fixed={customer} error={required('customer_id')} />
      {needsEnd && <Input label={t('service.followUps.fields.endsAt')} hint={t('service.followUps.fields.endsAtHint')} type="date" dir="ltr" value={form.subject_ends_at} onChange={(event) => set('subject_ends_at')(event.target.value)} error={required('subject_ends_at')} />}
      <Select label={t('service.followUps.columns.owner')} placeholder={t('service.followUps.ownerAuto')} value={form.owner_id} onChange={set('owner_id')} options={(setup.data?.agents || []).map((agent) => ({ value: agent.id, label: agent.name }))} />
    </FormDialog>
  )
}
