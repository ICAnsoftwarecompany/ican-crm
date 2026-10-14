import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { createId } from '../../state/initialWizardState'
import { SegmentedControl, TextAreaField, TextField, ToggleChip } from '../fields'
import { inputClassName } from '../fields/FieldFrame'

// Technical format hints (not translatable copy).
const URL_PLACEHOLDER = 'https://'

export const STANDARD_QUESTIONS = ['FULL_NAME', 'PHONE', 'EMAIL', 'CITY', 'STATE', 'JOB_TITLE', 'COMPANY_NAME', 'DATE_OF_BIRTH', 'GENDER']
const THANK_YOU_BUTTONS = ['VIEW_WEBSITE', 'CALL_BUSINESS', 'DOWNLOAD', 'NONE']

/** Instant form builder mirroring Meta's form editor: type, intro, questions, privacy, completion screen. */
export function LeadFormBuilder({ draft, path, onChange }) {
  const { t } = useTranslation()
  const update = (patch) => onChange({ ...draft, ...patch })
  const hasQuestion = (type) => draft.questions.some((question) => question.type === type)
  const toggleQuestion = (type) => update({ questions: hasQuestion(type) ? draft.questions.filter((question) => question.type !== type) : [...draft.questions, { id: createId('q'), type }] })
  const updateCustom = (id, patch) => update({ customQuestions: draft.customQuestions.map((question) => (question.id === id ? { ...question, ...patch } : question)) })
  const thankYou = draft.thankYou || {}

  return (
    <div className="grid gap-4 rounded-lg border border-[var(--border)] p-3">
      <TextField path={`${path}.name`} guideKey="leadForm.name" label={t('campaignWizard.leadForm.name')} required value={draft.name} onChange={(name) => update({ name })} hint={t('campaignWizard.leadForm.nameHint')} />

      <div className="grid gap-1.5">
        <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.leadForm.type')}</span>
        <SegmentedControl value={draft.formType} onChange={(formType) => update({ formType })} ariaLabel={t('campaignWizard.leadForm.type')}
          options={['more_volume', 'higher_intent'].map((value) => ({ value, label: t(`campaignWizard.leadForm.types.${value}.title`) }))} />
        <p className="text-xs leading-5 text-[var(--text-muted)]">{t(`campaignWizard.leadForm.types.${draft.formType}.description`)}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField path={`${path}.intro.headline`} guideKey="leadForm.intro" label={t('campaignWizard.leadForm.introHeadline')} optional value={draft.intro?.headline} onChange={(headline) => update({ intro: { ...draft.intro, headline } })} />
        <TextField path={`${path}.intro.description`} guideKey="leadForm.intro" label={t('campaignWizard.leadForm.introDescription')} optional value={draft.intro?.description} onChange={(description) => update({ intro: { ...draft.intro, description } })} />
      </div>

      <div className="grid gap-2" data-wizard-field={`${path}.questions`}>
        <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.leadForm.questions')}</span>
        <div className="flex flex-wrap gap-1.5">
          {STANDARD_QUESTIONS.map((type) => (
            <ToggleChip key={type} selected={hasQuestion(type)} onToggle={() => toggleQuestion(type)}>{t(`campaignWizard.leadForm.questionTypes.${type}`)}</ToggleChip>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)]">{t('campaignWizard.leadForm.questionsHint')}</p>
      </div>

      <div className="grid gap-2" data-wizard-field={`${path}.customQuestions`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.leadForm.customQuestions')}</span>
          <button type="button" onClick={() => update({ customQuestions: [...draft.customQuestions, { id: createId('cq'), label: '', kind: 'short', options: ['', ''] }] })} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-accent)]"><Plus size={13} />{t('campaignWizard.leadForm.addQuestion')}</button>
        </div>
        {draft.customQuestions.map((question) => (
          <div key={question.id} className="grid gap-2 rounded-md bg-[var(--surface-2)] p-2.5">
            <div className="flex items-center gap-2">
              <input value={question.label} onChange={(event) => updateCustom(question.id, { label: event.target.value })} placeholder={t('campaignWizard.leadForm.questionPlaceholder')} aria-label={t('campaignWizard.leadForm.questionPlaceholder')} className={inputClassName(false)} />
              <SegmentedControl size="sm" value={question.kind} onChange={(kind) => updateCustom(question.id, { kind })} ariaLabel={t('campaignWizard.leadForm.answerType')}
                options={[{ value: 'short', label: t('campaignWizard.leadForm.short') }, { value: 'choice', label: t('campaignWizard.leadForm.choice') }]} />
              <button type="button" onClick={() => update({ customQuestions: draft.customQuestions.filter((item) => item.id !== question.id) })} className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--notification-danger)]" aria-label={t('campaignWizard.common.remove')}><Trash2 size={14} /></button>
            </div>
            {question.kind === 'choice' && (
              <div className="grid gap-1.5 ps-3">
                {question.options.map((option, index) => (
                  <input key={index} value={option} onChange={(event) => updateCustom(question.id, { options: question.options.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) })} placeholder={t('campaignWizard.leadForm.optionPlaceholder', { count: index + 1 })} aria-label={t('campaignWizard.leadForm.optionPlaceholder', { count: index + 1 })} className={inputClassName(false)} />
                ))}
                <button type="button" onClick={() => updateCustom(question.id, { options: [...question.options, ''] })} className="justify-self-start text-xs font-semibold text-[var(--brand-accent)]">{t('campaignWizard.leadForm.addOption')}</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField path={`${path}.privacyPolicyUrl`} guideKey="leadForm.privacy" label={t('campaignWizard.leadForm.privacyUrl')} required dir="ltr" type="url" placeholder={URL_PLACEHOLDER} value={draft.privacyPolicyUrl} onChange={(privacyPolicyUrl) => update({ privacyPolicyUrl })} />
        <TextField path={`${path}.privacyLinkText`} guideKey="leadForm.privacy" label={t('campaignWizard.leadForm.privacyText')} optional value={draft.privacyLinkText} onChange={(privacyLinkText) => update({ privacyLinkText })} />
      </div>

      <div className="grid gap-3 border-t border-[var(--border)] pt-3">
        <span className="text-sm font-bold text-[var(--text)]">{t('campaignWizard.leadForm.thankYouTitle')}</span>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField path={`${path}.thankYou.headline`} guideKey="leadForm.thankYou" label={t('campaignWizard.leadForm.thankYouHeadline')} optional value={thankYou.headline} onChange={(headline) => update({ thankYou: { ...thankYou, headline } })} />
          <TextAreaField path={`${path}.thankYou.description`} guideKey="leadForm.thankYou" label={t('campaignWizard.leadForm.thankYouDescription')} optional rows={2} value={thankYou.description} onChange={(description) => update({ thankYou: { ...thankYou, description } })} />
        </div>
        <SegmentedControl size="sm" value={thankYou.buttonType} onChange={(buttonType) => update({ thankYou: { ...thankYou, buttonType } })} ariaLabel={t('campaignWizard.leadForm.thankYouButton')}
          options={THANK_YOU_BUTTONS.map((value) => ({ value, label: t(`campaignWizard.leadForm.thankYouButtons.${value}`) }))} />
        {thankYou.buttonType === 'VIEW_WEBSITE' && <TextField path={`${path}.thankYou.website`} guideKey="leadForm.thankYou" label={t('campaignWizard.leadForm.thankYouWebsite')} dir="ltr" type="url" placeholder={URL_PLACEHOLDER} value={thankYou.website} onChange={(website) => update({ thankYou: { ...thankYou, website } })} />}
        {thankYou.buttonType === 'CALL_BUSINESS' && <TextField path={`${path}.thankYou.phone`} guideKey="leadForm.thankYou" label={t('campaignWizard.leadForm.thankYouPhone')} dir="ltr" inputMode="tel" value={thankYou.phone} onChange={(phone) => update({ thankYou: { ...thankYou, phone } })} />}
      </div>
    </div>
  )
}
