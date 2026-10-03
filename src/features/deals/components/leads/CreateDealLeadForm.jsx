import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useDealLeadMutations } from '../../hooks/useDealLeads'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'

const EMPTY = { name: '', phone: '', email: '', company: '', source: 'manual', owner_id: '', note: '' }
const SOURCES = ['manual', 'facebook', 'whatsapp', 'messenger', 'website', 'referral', 'google', 'other']

/** New lead created inside the deal (`POST /deals/leads/create`: creates the CRM lead + the deal lead). */
export function CreateDealLeadForm({ dealId, people, onDone }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const { create } = useDealLeadMutations(dealId)
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target ? event.target.value : event }))

  const submit = async () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = t('dealWorkspace.leads.new.nameRequired')
    if (!form.phone.trim()) nextErrors.phone = t('dealWorkspace.leads.new.phoneRequired')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const payload = Object.fromEntries(Object.entries({ ...form, type: 'lead', linked_type: 'manual' }).filter(([, value]) => value !== ''))
    if (payload.owner_id) payload.owner_id = Number(payload.owner_id) || payload.owner_id
    try {
      await create.mutateAsync(payload)
      toast.success(t('dealWorkspace.leads.new.success'))
      setForm(EMPTY)
      onDone()
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.leads.new.failed')))
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldLabel label={t('dealWorkspace.fields.name')} error={errors.name}><input className={dealInputClass} value={form.name} onChange={set('name')} /></FieldLabel>
        <FieldLabel label={t('dealWorkspace.fields.phone')} error={errors.phone}><input dir="ltr" className={dealInputClass} value={form.phone} onChange={set('phone')} /></FieldLabel>
        <FieldLabel label={t('dealWorkspace.fields.email')}><input dir="ltr" type="email" className={dealInputClass} value={form.email} onChange={set('email')} /></FieldLabel>
        <FieldLabel label={t('dealWorkspace.fields.company')}><input className={dealInputClass} value={form.company} onChange={set('company')} /></FieldLabel>
        <FieldLabel label={t('dealWorkspace.fields.source')}>
          <select className={dealInputClass} value={form.source} onChange={set('source')}>
            {SOURCES.map((value) => <option key={value} value={value}>{t(`dealWorkspace.sources.${value}`)}</option>)}
          </select>
        </FieldLabel>
        <FieldLabel label={t('dealWorkspace.fields.owner')}><PersonSelect people={people} value={form.owner_id} onChange={(value) => setForm((current) => ({ ...current, owner_id: value }))} /></FieldLabel>
      </div>
      <FieldLabel label={t('dealWorkspace.fields.note')}><textarea className={`${dealInputClass} h-20 py-2`} value={form.note} onChange={set('note')} /></FieldLabel>
      <div className="flex justify-end"><Button onClick={submit} loading={create.isPending} disabled={create.isPending}>{t('dealWorkspace.leads.new.submit')}</Button></div>
    </div>
  )
}
