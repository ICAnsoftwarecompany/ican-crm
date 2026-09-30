import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { splitTags } from '../../settings/resources/schedulingResources'
import { useAiMutations, useAiSettings } from '../api/aiApi'
import { AiUsageCard } from './AiUsageCard'

export const AI_FEATURE_KEYS = ['triage', 'sentiment', 'suggested_reply', 'summaries', 'duplicates', 'smart_assignment', 'agent']
const HANDOFF_TOPICS = ['money', 'complaint', 'cancellation']

/** Settings → AI (spec §45.4): each feature on/off, tone, language, auto-reply limits, blocked topics, monthly limit. */
export function AiSettingsPanel({ resource }) {
  const { t } = useTranslation()
  const settings = useAiSettings()
  const { saveSettings } = useAiMutations()
  const [form, setForm] = useState(null)
  const [blockedText, setBlockedText] = useState('')
  const errors = getServiceFieldErrors(saveSettings.error)
  useEffect(() => {
    if (settings.data) {
      setForm(settings.data)
      setBlockedText((settings.data.blocked_topics || []).join(', '))
    }
  }, [settings.data])
  const set = (name, value) => setForm((current) => ({ ...current, [name]: value }))
  const toggleTopic = (topic) => set('handoff_topics', form.handoff_topics.includes(topic) ? form.handoff_topics.filter((entry) => entry !== topic) : [...form.handoff_topics, topic])
  const submit = (event) => {
    event.preventDefault()
    saveSettings.mutate({ ...form, blocked_topics: splitTags(blockedText), monthly_limit: Number(form.monthly_limit), auto_reply: { ...form.auto_reply, min_confidence: Number(form.auto_reply.min_confidence), max_per_conversation: Number(form.auto_reply.max_per_conversation) } }, { onSuccess: () => toast.success(t('service.ai.settings.saved')) })
  }

  return (
    <div className="grid gap-4">
      <header className="grid gap-1">
        <h2 className="text-lg font-bold text-[var(--text)]">{t(`${resource.i18nKey}.title`)}</h2>
        <p className="text-sm text-[var(--text-muted)]">{t(`${resource.i18nKey}.description`)}</p>
      </header>
      <AiUsageCard />
      <ResourceState isLoading={settings.isLoading || !form} error={settings.error} onRetry={settings.refetch}>
        {form && (
          <form className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" onSubmit={submit}>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium text-[var(--text)]">{t('service.ai.settings.features')}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {AI_FEATURE_KEYS.map((key) => (
                  <label key={key} className="flex items-start gap-2 rounded-md border border-[var(--border)] p-2 text-sm text-[var(--text)]">
                    <input type="checkbox" className="mt-0.5" checked={Boolean(form.features[key])} onChange={(event) => set('features', { ...form.features, [key]: event.target.checked })} />
                    <span className="grid"><span className="font-medium">{t(`service.ai.features.${key}.label`)}</span><span className="text-xs text-[var(--text-muted)]">{t(`service.ai.features.${key}.hint`)}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-3">
              <Select label={t('service.ai.settings.tone')} value={form.tone} onChange={(value) => set('tone', value || 'friendly')} options={['friendly', 'formal', 'concise'].map((value) => ({ value, label: t(`service.ai.tones.${value}`) }))} />
              <Select label={t('service.ai.settings.language')} value={form.language} onChange={(value) => set('language', value || 'auto')} options={['auto', 'ar', 'en'].map((value) => ({ value, label: t(`service.ai.languages.${value}`) }))} />
              <Input label={t('service.ai.settings.monthlyLimit')} type="number" dir="ltr" min={0} value={form.monthly_limit} onChange={(event) => set('monthly_limit', event.target.value)} error={errors.monthly_limit && t('service.settings.validation.invalid')} />
            </div>
            <fieldset className="grid gap-2 rounded-md border border-[var(--border)] p-3">
              <legend className="px-1 text-sm font-medium text-[var(--text)]">{t('service.ai.settings.autoReply')}</legend>
              <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
                <input type="checkbox" checked={Boolean(form.auto_reply.enabled)} onChange={(event) => set('auto_reply', { ...form.auto_reply, enabled: event.target.checked })} />
                {t('service.ai.settings.autoReplyEnabled')}
              </label>
              <p className="text-xs text-[var(--text-muted)]">{t('service.ai.settings.autoReplyHint')}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label={t('service.ai.settings.minConfidence')} type="number" dir="ltr" step="0.05" min={0.5} max={1} value={form.auto_reply.min_confidence} disabled={!form.auto_reply.enabled} onChange={(event) => set('auto_reply', { ...form.auto_reply, min_confidence: event.target.value })} error={errors['auto_reply.min_confidence'] && t('service.ai.settings.confidenceRange')} />
                <Input label={t('service.ai.settings.maxPerConversation')} type="number" dir="ltr" min={1} value={form.auto_reply.max_per_conversation} disabled={!form.auto_reply.enabled} onChange={(event) => set('auto_reply', { ...form.auto_reply, max_per_conversation: event.target.value })} />
              </div>
            </fieldset>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium text-[var(--text)]">{t('service.ai.settings.handoffTopics')}</legend>
              <div className="flex flex-wrap gap-3">
                {HANDOFF_TOPICS.map((topic) => (
                  <label key={topic} className="inline-flex items-center gap-2 text-sm text-[var(--text)]"><input type="checkbox" checked={form.handoff_topics.includes(topic)} onChange={() => toggleTopic(topic)} />{t(`service.ai.topics.${topic}`)}</label>
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)]">{t('service.ai.settings.handoffHint')}</p>
            </fieldset>
            <Input label={t('service.ai.settings.blockedTopics')} hint={t('service.ai.settings.blockedHint')} dir="auto" value={blockedText} onChange={(event) => setBlockedText(event.target.value)} />
            <Button type="submit" className="w-fit" loading={saveSettings.isPending}>{t('service.settings.actions.save')}</Button>
          </form>
        )}
      </ResourceState>
    </div>
  )
}
