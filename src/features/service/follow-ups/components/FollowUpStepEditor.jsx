import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { formToOffset, formToRule, KNOWN_OUTCOMES, offsetToForm, ruleToForm, STEP_CHANNELS } from '../constants/followUps'
import { splitTags } from '../../settings/resources/schedulingResources'
import { outcomeLabel } from './followUpLabels'

const UNITS = ['hour', 'day', 'week', 'month']

/** One program step: when (offset), how (channel), the task title, checklist, outcomes and what each outcome does. */
export function FollowUpStepEditor({ step, index, count, caseTypes, onChange, onMove, onRemove }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language === 'ar' ? 'ar' : 'en'
  const offset = offsetToForm(step.offset)
  const setOffset = (patch) => onChange({ offset: formToOffset({ ...offset, ...patch }) })
  const checklistText = (step.checklist || []).map((item) => localizeLabel(item, language, '')).join(', ')
  const setRule = (outcome, patch) => {
    const next = { ...ruleToForm(step.on_outcome?.[outcome]), ...patch }
    const rule = formToRule(next)
    const rules = { ...(step.on_outcome || {}) }
    if (rule) rules[outcome] = rule
    else delete rules[outcome]
    onChange({ on_outcome: rules, [`_draft_${outcome}`]: next.type })
  }
  const caseTypeOptions = caseTypes.map((type) => ({ value: type.id, label: localizeLabel(type.label, i18n.language, type.key) }))

  return (
    <div className="grid gap-3 rounded-lg border border-[var(--border)] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[var(--text)]">{t('service.followUps.stepN', { n: index + 1 })}</span>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="icon" disabled={index === 0} aria-label={t('service.followUps.moveUp')} onClick={() => onMove(-1)}><ArrowUp size={14} aria-hidden="true" /></Button>
          <Button type="button" variant="ghost" size="icon" disabled={index === count - 1} aria-label={t('service.followUps.moveDown')} onClick={() => onMove(1)}><ArrowDown size={14} aria-hidden="true" /></Button>
          <Button type="button" variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={onRemove}><Trash2 size={14} aria-hidden="true" /></Button>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-[8rem_6rem_7rem_minmax(0,1fr)_9rem]">
        <Input label={t('service.settings.fields.key')} dir="ltr" value={step.key || ''} onChange={(event) => onChange({ key: event.target.value.replace(/\s+/g, '_').toLowerCase() })} />
        <Input label={t('service.followUps.fields.amount')} type="number" dir="ltr" min={0} value={offset.amount} onChange={(event) => setOffset({ amount: event.target.value })} />
        <Select label={t('service.followUps.fields.unit')} value={offset.unit} onChange={(unit) => setOffset({ unit: unit || 'day' })} options={UNITS.map((unit) => ({ value: unit, label: t(`service.followUps.units.${unit}`) }))} />
        <Select label={t('service.followUps.fields.when')} value={offset.direction} onChange={(direction) => setOffset({ direction: direction || 'after_start' })} options={['after_start', 'before_end'].map((value) => ({ value, label: t(`service.followUps.directions.${value}`) }))} />
        <Select label={t('service.followUps.fields.channel')} value={step.channel || 'call'} onChange={(channel) => onChange({ channel: channel || 'call' })} options={STEP_CHANNELS.map((channel) => ({ value: channel, label: t(`service.followUps.channels.${channel}`) }))} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input label={t('service.followUps.fields.taskTitleAr')} lang="ar" dir="auto" value={step.task_title?.ar || ''} onChange={(event) => onChange({ task_title: { ...step.task_title, ar: event.target.value } })} />
        <Input label={t('service.followUps.fields.taskTitleEn')} lang="en" dir="ltr" value={step.task_title?.en || ''} onChange={(event) => onChange({ task_title: { ...step.task_title, en: event.target.value } })} />
      </div>
      <Input label={t('service.followUps.fields.checklist')} hint={t('service.followUps.fields.checklistHint')} dir="auto" value={checklistText} onChange={(event) => onChange({ checklist: splitTags(event.target.value).map((item, itemIndex) => ({ ...(step.checklist?.[itemIndex] || {}), [language]: item })) })} />
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium text-[var(--text)]">{t('service.followUps.fields.outcomes')}</legend>
        <div className="flex flex-wrap gap-2">
          {KNOWN_OUTCOMES.map((outcome) => (
            <label key={outcome} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--text)]">
              <input type="checkbox" checked={(step.outcomes || []).includes(outcome)} onChange={(event) => {
                const outcomes = event.target.checked ? [...(step.outcomes || []), outcome] : (step.outcomes || []).filter((entry) => entry !== outcome)
                const rules = Object.fromEntries(Object.entries(step.on_outcome || {}).filter(([key]) => outcomes.includes(key)))
                onChange({ outcomes, on_outcome: rules })
              }} />
              {outcomeLabel(t, outcome)}
            </label>
          ))}
        </div>
        {(step.outcomes || []).map((outcome) => {
          const rule = ruleToForm(step.on_outcome?.[outcome])
          const type = step.on_outcome?.[outcome] ? rule.type : step[`_draft_${outcome}`] || 'next'
          return (
            <div key={outcome} className="grid items-end gap-2 sm:grid-cols-[9rem_11rem_minmax(0,1fr)]">
              <span className="pb-2 text-xs font-medium text-[var(--text)]">{outcomeLabel(t, outcome)}</span>
              <Select aria-label={t('service.followUps.fields.then')} value={type} onChange={(next) => setRule(outcome, next === 'retry' ? { type: 'retry', every: 1, unit: 'day', max: 1 } : { type: next || 'next' })} options={['next', 'retry', 'create_case'].map((value) => ({ value, label: t(`service.followUps.rules.${value}`) }))} />
              {type === 'retry' && (
                <div className="grid grid-cols-3 gap-2">
                  <Input aria-label={t('service.followUps.fields.amount')} type="number" dir="ltr" min={1} value={rule.every || 1} onChange={(event) => setRule(outcome, { type: 'retry', every: event.target.value })} />
                  <Select aria-label={t('service.followUps.fields.unit')} value={rule.unit || 'day'} onChange={(unit) => setRule(outcome, { type: 'retry', unit: unit || 'day' })} options={['hour', 'day', 'week'].map((unit) => ({ value: unit, label: t(`service.followUps.units.${unit}`) }))} />
                  <Input aria-label={t('service.followUps.fields.maxRetries')} placeholder={t('service.followUps.fields.maxRetries')} type="number" dir="ltr" min={1} value={rule.max || 1} onChange={(event) => setRule(outcome, { type: 'retry', max: event.target.value })} />
                </div>
              )}
              {type === 'create_case' && <Select aria-label={t('service.followUps.fields.caseType')} placeholder={t('service.followUps.fields.caseType')} value={rule.case_type_id || ''} onChange={(caseTypeId) => setRule(outcome, { type: 'create_case', case_type_id: caseTypeId })} options={caseTypeOptions} />}
            </div>
          )
        })}
      </fieldset>
    </div>
  )
}
