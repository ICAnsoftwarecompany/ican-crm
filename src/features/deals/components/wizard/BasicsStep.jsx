import { useTranslation } from 'react-i18next'
import { useUsers } from '../../../users'
import { DEAL_STATUSES, DEAL_TYPES } from '../../constants/dealOptions'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'

/** Step 2 — the deal's first data: name, description, type, status, period, targets, owner. */
export function BasicsStep({ value, onChange, errors = {} }) {
  const { t } = useTranslation()
  const usersQuery = useUsers()
  const users = (usersQuery.data || []).map((user) => ({ id: String(user.id), name: user.name || user.email || '' }))
  const set = (key) => (event) => onChange({ [key]: event.target.value })
  const err = (key) => (errors[key] ? t(`dealWorkspace.wizard.errors.${errors[key]}`) : null)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FieldLabel label={t('dealWorkspace.fields.name')} error={err('name')} className="sm:col-span-2">
        <input className={dealInputClass} value={value.name} onChange={set('name')} placeholder={t('dealWorkspace.wizard.basics.namePlaceholder')} />
      </FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.description')} className="sm:col-span-2">
        <textarea className={`${dealInputClass} h-20 py-2`} value={value.description} onChange={set('description')} />
      </FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.type')} hint={t(`dealWorkspace.wizard.basics.typeHints.${value.type}`)}>
        <select className={dealInputClass} value={value.type} onChange={set('type')}>
          {DEAL_TYPES.map((type) => <option key={type} value={type}>{t(`dealWorkspace.options.dealType.${type}`)}</option>)}
        </select>
      </FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.status')}>
        <select className={dealInputClass} value={value.status} onChange={set('status')}>
          {DEAL_STATUSES.map((status) => <option key={status} value={status}>{t(`dealWorkspace.options.dealStatus.${status}`)}</option>)}
        </select>
      </FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.startDate')}><input type="date" dir="ltr" className={dealInputClass} value={value.start_date} onChange={set('start_date')} /></FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.endDate')} error={err('end_date')}><input type="date" dir="ltr" className={dealInputClass} value={value.end_date} onChange={set('end_date')} /></FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.leads')} error={err('target_leads')}><input type="number" min="0" className={dealInputClass} value={value.target_leads} onChange={set('target_leads')} /></FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.revenue')} error={err('target_revenue')}><input type="number" min="0" className={dealInputClass} value={value.target_revenue} onChange={set('target_revenue')} /></FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.owner')} hint={t('dealWorkspace.wizard.basics.ownerHint')}>
        <PersonSelect people={users} value={value.owner_id} onChange={(ownerId) => onChange({ owner_id: ownerId })} />
      </FieldLabel>
    </div>
  )
}
