import { useTranslation } from 'react-i18next'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'

export function ProductDetailsFields({ value = {}, onChange, disabled = false }) {
  const { t } = useTranslation()
  const set = (key, raw) => {
    const next = { ...value }
    if (raw === '') delete next[key]
    else next[key] = ['quantity', 'unit_price', 'discount'].includes(key) ? Number(raw) : raw
    onChange(next)
  }
  return <fieldset disabled={disabled} className="grid min-w-0 gap-3 sm:grid-cols-2">
    {['quantity', 'unit_price', 'discount', 'package'].map((key) => <FieldLabel key={key} label={t(`dealWorkspace.products.details.${key}`)}><input className={dealInputClass} type={key === 'package' ? 'text' : 'number'} min={key === 'package' ? undefined : 0} step="any" value={value[key] ?? ''} onChange={(event) => set(key, event.target.value)} /></FieldLabel>)}
    <div className="sm:col-span-2"><FieldLabel label={t('dealWorkspace.products.details.notes')}><textarea className={`${dealInputClass} h-20 py-2`} value={value.notes ?? ''} onChange={(event) => set('notes', event.target.value)} /></FieldLabel></div>
  </fieldset>
}
