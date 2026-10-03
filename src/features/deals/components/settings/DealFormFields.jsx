import { useTranslation } from 'react-i18next'
import { DEAL_STATUSES, DEAL_TYPES } from '../../constants/dealOptions'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'

export const EMPTY_DEAL_FORM = {
  name: '', description: '', pipeline_template_id: '', type: 'sales', status: 'active',
  start_date: '', end_date: '', target_revenue: '', target_leads: '', owner_id: '',
}

export function dealToForm(deal) {
  if (!deal) return { ...EMPTY_DEAL_FORM }
  const status = typeof deal.status === 'object' ? deal.status?.status || deal.status?.name : deal.status
  return {
    name: deal.name || '',
    description: deal.description || '',
    pipeline_template_id: deal.pipeline_template_id ? String(deal.pipeline_template_id) : '',
    type: deal.type || 'sales',
    status: status || 'active',
    start_date: String(deal.start_date || '').slice(0, 10),
    end_date: String(deal.end_date || '').slice(0, 10),
    target_revenue: deal.target_revenue ?? '',
    target_leads: deal.target_leads ?? '',
    owner_id: deal.owner_id ? String(deal.owner_id) : '',
  }
}

/** Body for create/update: empty values dropped, numbers cast. Returns `{ payload, errors }`. */
export function buildDealPayload(form, { requireTemplate = true } = {}) {
  const errors = {}
  if (!String(form.name).trim()) errors.name = 'nameRequired'
  if (requireTemplate && !form.pipeline_template_id) errors.pipeline_template_id = 'pipelineRequired'
  if (form.start_date && form.end_date && form.end_date < form.start_date) errors.end_date = 'endBeforeStart'
  const numeric = new Set(['pipeline_template_id', 'target_revenue', 'target_leads', 'owner_id'])
  const payload = Object.fromEntries(Object.entries(form)
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .map(([key, value]) => [key, numeric.has(key) ? Number(value) : (typeof value === 'string' ? value.trim() : value)]))
  return { payload, errors }
}

/** Fields of a deal (create dialog in the hub + General settings of a deal). */
export function DealFormFields({ form, setForm, errors = {}, templates = [], users = [], lockTemplate = false }) {
  const { t } = useTranslation()
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const err = (key) => (errors[key] ? t(`dealWorkspace.form.errors.${errors[key]}`) : null)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FieldLabel label={t('dealWorkspace.fields.name')} error={err('name')} className="sm:col-span-2"><input className={dealInputClass} value={form.name} onChange={set('name')} /></FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.description')} className="sm:col-span-2"><textarea className={`${dealInputClass} h-20 py-2`} value={form.description} onChange={set('description')} /></FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.pipeline')} error={err('pipeline_template_id')} hint={lockTemplate ? t('dealWorkspace.form.templateLocked') : t('dealWorkspace.form.templateHint')}>
        <select className={dealInputClass} value={form.pipeline_template_id} disabled={lockTemplate} onChange={set('pipeline_template_id')}>
          <option value="">{t('dealWorkspace.common.choose')}</option>
          {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.owner')}>
        <PersonSelect people={users} value={form.owner_id} onChange={(value) => setForm((current) => ({ ...current, owner_id: value }))} />
      </FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.type')}>
        <select className={dealInputClass} value={form.type} onChange={set('type')}>
          {DEAL_TYPES.map((value) => <option key={value} value={value}>{t(`dealWorkspace.options.dealType.${value}`)}</option>)}
        </select>
      </FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.status')}>
        <select className={dealInputClass} value={form.status} onChange={set('status')}>
          {DEAL_STATUSES.map((value) => <option key={value} value={value}>{t(`dealWorkspace.options.dealStatus.${value}`)}</option>)}
        </select>
      </FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.startDate')}><input type="date" dir="ltr" className={dealInputClass} value={form.start_date} onChange={set('start_date')} /></FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.endDate')} error={err('end_date')}><input type="date" dir="ltr" className={dealInputClass} value={form.end_date} onChange={set('end_date')} /></FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.leads')}><input type="number" min="0" className={dealInputClass} value={form.target_leads} onChange={set('target_leads')} /></FieldLabel>
      <FieldLabel label={t('dealWorkspace.fields.revenue')}><input type="number" min="0" className={dealInputClass} value={form.target_revenue} onChange={set('target_revenue')} /></FieldLabel>
    </div>
  )
}
