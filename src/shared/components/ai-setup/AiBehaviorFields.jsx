import { useTranslation } from 'react-i18next'
import { Select } from '../ui/Select'
import { AI_AUTONOMY_LEVELS, AI_LANGUAGES, AI_TONES } from './aiSetupModel'
import { AiToggle } from './AiSetupSection'

/** Tone, language, autonomy, custom instructions and human hand-off. */
export function AiBehaviorFields({ values, onChange, disabled = false }) {
  const { t } = useTranslation()
  const set = (key) => (value) => onChange({ ...values, [key]: value })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label={t('aiSetup.behavior.tone')}
          value={values.tone}
          onChange={set('tone')}
          disabled={disabled}
          options={AI_TONES.map((tone) => ({ value: tone, label: t(`aiSetup.tones.${tone}`) }))}
        />
        <Select
          label={t('aiSetup.behavior.language')}
          value={values.language}
          onChange={set('language')}
          disabled={disabled}
          options={AI_LANGUAGES.map((language) => ({ value: language, label: t(`aiSetup.languages.${language}`) }))}
        />
        <Select
          label={t('aiSetup.behavior.autonomy')}
          value={values.autonomy}
          onChange={set('autonomy')}
          disabled={disabled}
          options={AI_AUTONOMY_LEVELS.map((level) => ({ value: level, label: t(`aiSetup.autonomy.${level}`) }))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ai-setup-instructions" className="text-sm font-medium text-[var(--text)]">
          {t('aiSetup.behavior.instructions')}
        </label>
        <textarea
          id="ai-setup-instructions"
          rows={4}
          value={values.instructions}
          disabled={disabled}
          onChange={(event) => set('instructions')(event.target.value)}
          placeholder={t('aiSetup.behavior.instructionsPlaceholder')}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] disabled:opacity-50"
        />
      </div>

      <AiToggle
        checked={values.handoffToHuman}
        onChange={set('handoffToHuman')}
        disabled={disabled}
        label={t('aiSetup.behavior.handoff')}
        description={t('aiSetup.behavior.handoffDescription')}
      />
    </div>
  )
}
