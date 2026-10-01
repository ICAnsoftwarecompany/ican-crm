import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { TextAreaField } from '../fields'
import { inputClassName } from '../fields/FieldFrame'

const MAX_ICE_BREAKERS = 4

/** Messenger / WhatsApp / Instagram Direct welcome message and suggested questions. */
export function MessagingFields({ template, path, onChange }) {
  const { t } = useTranslation()
  const iceBreakers = template.iceBreakers?.length ? template.iceBreakers : ['']
  const update = (patch) => onChange({ messageTemplate: { ...template, ...patch } })

  return (
    <div className="grid gap-3" data-wizard-field={path}>
      <TextAreaField path={path} guideKey="ad.messageTemplate" label={t('campaignWizard.messaging.greeting')} rows={2} recommendedLength={300} value={template.greeting} placeholder={t('campaignWizard.messaging.greetingPlaceholder')} onChange={(greeting) => update({ greeting })} hint={t('campaignWizard.messaging.greetingHint')} />
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.messaging.iceBreakers')}</span>
          {iceBreakers.length < MAX_ICE_BREAKERS && (
            <button type="button" onClick={() => update({ iceBreakers: [...iceBreakers, ''] })} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-accent)]"><Plus size={13} />{t('campaignWizard.messaging.addQuestion')}</button>
          )}
        </div>
        {iceBreakers.map((question, index) => (
          <div key={index} className="relative">
            <input value={question} onChange={(event) => update({ iceBreakers: iceBreakers.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) })} placeholder={t('campaignWizard.messaging.questionPlaceholder', { count: index + 1 })} aria-label={t('campaignWizard.messaging.questionPlaceholder', { count: index + 1 })} className={`${inputClassName(false)} pe-8`} maxLength={80} />
            {iceBreakers.length > 1 && <button type="button" onClick={() => update({ iceBreakers: iceBreakers.filter((_, itemIndex) => itemIndex !== index) })} className="absolute end-2 top-2.5 rounded p-0.5 text-[var(--text-muted)]" aria-label={t('campaignWizard.common.remove')}><X size={13} /></button>}
          </div>
        ))}
        <p className="text-xs text-[var(--text-muted)]">{t('campaignWizard.messaging.iceBreakersHint')}</p>
      </div>
    </div>
  )
}
