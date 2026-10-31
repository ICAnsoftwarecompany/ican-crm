import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../shared/components/ui/Button'

export const leadInputClass = 'h-10 w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]'

export function LeadExtraFields({ form, setField, products }) {
  const { t } = useTranslation()
  const tr = (key) => t(`customers.leadCreate.${key}`)
  const update = (key, index, patch) => setField(key, form[key].map((item, position) => position === index ? { ...item, ...patch } : item))
  return <>
    <section className="space-y-2 border-t border-[var(--border)] pt-4">
      <div className="flex items-center justify-between"><h3 className="text-sm font-bold">{tr('attributes')}</h3><Button size="icon" variant="outline" title={tr('addAttribute')} aria-label={tr('addAttribute')} onClick={() => setField('attributes', [...form.attributes, { key: '', value: '' }])}><Plus size={16} /></Button></div>
      {form.attributes.map((item, index) => <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2"><input className={leadInputClass} aria-label={tr('attributeName')} placeholder={tr('attributeName')} value={item.key} onChange={(event) => update('attributes', index, { key: event.target.value })} /><input className={leadInputClass} aria-label={tr('attributeValue')} placeholder={tr('attributeValue')} value={item.value} onChange={(event) => update('attributes', index, { value: event.target.value })} /><Button size="icon" variant="ghost" title={tr('remove')} aria-label={tr('remove')} onClick={() => setField('attributes', form.attributes.filter((_, position) => position !== index))}><Trash2 size={15} /></Button></div>)}
    </section>
    <section className="space-y-3 border-t border-[var(--border)] pt-4">
      <div className="flex items-center justify-between"><h3 className="text-sm font-bold">{tr('interests')}</h3><Button size="icon" variant="outline" title={tr('addInterest')} aria-label={tr('addInterest')} onClick={() => setField('interesteds', [...form.interesteds, { product_id: '', note: '', interest_level: 'medium' }])}><Plus size={16} /></Button></div>
      {form.interesteds.map((item, index) => <div key={index} className="space-y-2 border-b border-[var(--border)] pb-3"><div className="flex gap-2"><select required className={leadInputClass} aria-label={tr('product')} value={item.product_id} onChange={(event) => update('interesteds', index, { product_id: event.target.value })}><option value="">{tr('product')}</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select><select className={leadInputClass} aria-label={tr('interestLevel')} value={item.interest_level} onChange={(event) => update('interesteds', index, { interest_level: event.target.value })}>{['low', 'medium', 'high'].map((level) => <option key={level} value={level}>{tr(level)}</option>)}</select><Button size="icon" variant="ghost" title={tr('remove')} aria-label={tr('remove')} onClick={() => setField('interesteds', form.interesteds.filter((_, position) => position !== index))}><Trash2 size={15} /></Button></div><input className={leadInputClass} aria-label={tr('interestNote')} placeholder={tr('interestNote')} value={item.note} onChange={(event) => update('interesteds', index, { note: event.target.value })} /></div>)}
    </section>
    <label className="grid gap-2 text-sm">{tr('note')}<textarea className={`${leadInputClass} h-24 py-2`} value={form.note} onChange={(event) => setField('note', event.target.value)} /></label>
  </>
}
