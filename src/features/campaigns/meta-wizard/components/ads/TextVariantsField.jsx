import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { useWizardField } from '../../context/MetaWizardContext'
import { FieldFrame, inputClassName } from '../fields/FieldFrame'
import { cn } from '../../../../../shared/utils/cn'

/**
 * Up to N text variants (Meta tests them and shows the best one per
 * person — "multiple text options" in Ads Manager).
 */
export function TextVariantsField({ path, guideKey, label, values, onChange, max, recommendedLength, multiline, placeholder, required }) {
  const { t } = useTranslation()
  const { issue, hasError, fieldProps } = useWizardField(path, guideKey)
  const list = values.length ? values : ['']
  const update = (index, value) => onChange(list.map((item, itemIndex) => (itemIndex === index ? value : item)))
  const Control = multiline ? 'textarea' : 'input'

  return (
    <FieldFrame label={label} issue={issue} required={required} fieldProps={fieldProps}
      action={list.length < max ? <button type="button" onClick={() => onChange([...list, ''])} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-accent)]"><Plus size={12} />{t('campaignWizard.ads.addVariant')}</button> : null}>
      <div className="grid gap-2">
        {list.map((value, index) => (
          <div key={index} className="relative">
            <Control
              rows={multiline ? 3 : undefined}
              value={value}
              placeholder={index === 0 ? placeholder : t('campaignWizard.ads.variantPlaceholder', { count: index + 1 })}
              onChange={(event) => update(index, event.target.value)}
              onFocus={fieldProps.onFocus}
              onBlur={fieldProps.onBlur}
              aria-label={`${label} ${index + 1}`}
              className={cn(inputClassName(hasError && index === 0), multiline && 'h-auto py-2 leading-6', list.length > 1 && 'pe-8')}
            />
            {list.length > 1 && (
              <button type="button" onClick={() => onChange(list.filter((_, itemIndex) => itemIndex !== index))} className="absolute end-2 top-2.5 rounded p-0.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)]" aria-label={t('campaignWizard.common.remove')}><X size={13} /></button>
            )}
            {recommendedLength && value.length > 0 && (
              <span className={cn('mt-0.5 block text-end text-[10px]', value.length > recommendedLength ? 'text-[var(--notification-warning)]' : 'text-[var(--text-light)]')} dir="ltr">{value.length}/{recommendedLength}</span>
            )}
          </div>
        ))}
      </div>
    </FieldFrame>
  )
}
