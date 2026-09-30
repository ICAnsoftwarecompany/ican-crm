import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Save, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/Button'
import { ModuleNotice, ModulePageHeader } from '../module-pages'
import { AiBehaviorFields } from './AiBehaviorFields'
import { AiCapabilityList } from './AiCapabilityList'
import { AiSetupSection, AiToggle } from './AiSetupSection'
import { normalizeAiSetup } from './aiSetupModel'
import { useAiSetupDraft } from './useAiSetupDraft'

/**
 * Shared "AI setup" page for any module (calls, meetings, conversations, team chat, ...).
 *
 * Two persistence modes:
 * - no `onSave`  → draft saved in this browser only (a notice says so). Used until `features/ai`
 *   exposes a settings API.
 * - `onSave`     → the caller (a `features/ai` adapter) persists; `initialValues` comes from it.
 *
 * @param {object} props
 * @param {string} props.scopeKey - Stable id of the module ('calls', 'meetings', ...).
 * @param {{ id: string, label: string, description?: string }[]} props.capabilities - Translated.
 * @param {object} [props.initialValues]
 * @param {(values: object) => Promise<void>} [props.onSave]
 * @param {boolean} [props.isSaving]
 */
export function AiSetupPage({ scopeKey, icon = Sparkles, title, description, capabilities = [], initialValues, onSave, isSaving = false }) {
  const { t } = useTranslation()
  // Keyed by content, not identity: callers usually rebuild `capabilities`/`initialValues` every render.
  const capabilityKey = capabilities.map((capability) => capability.id).join('|')
  const capabilityIds = useMemo(() => (capabilityKey ? capabilityKey.split('|') : []), [capabilityKey])
  const { savedValues, saveDraft } = useAiSetupDraft(scopeKey, capabilityIds)
  const baseline = useMemo(
    () => (onSave ? normalizeAiSetup(initialValues, capabilityIds) : savedValues),
    [capabilityIds, initialValues, onSave, savedValues]
  )
  const baselineKey = JSON.stringify(baseline)
  const [values, setValues] = useState(baseline)

  useEffect(() => {
    setValues(JSON.parse(baselineKey))
  }, [baselineKey])

  const isDirty = JSON.stringify(values) !== baselineKey
  const disabled = isSaving

  const handleSave = async () => {
    try {
      if (onSave) await onSave(normalizeAiSetup(values, capabilityIds))
      else saveDraft(values)
      toast.success(t('aiSetup.saved'))
    } catch {
      toast.error(t('aiSetup.saveFailed'))
    }
  }

  return (
    <div className="space-y-4">
      <ModulePageHeader
        icon={icon}
        title={title}
        description={description}
        actions={(
          <>
            <Button variant="outline" onClick={() => setValues(baseline)} disabled={!isDirty || disabled}>
              <RotateCcw size={15} />
              {t('aiSetup.reset')}
            </Button>
            <Button variant="accent" onClick={handleSave} disabled={!isDirty || disabled}>
              <Save size={15} />
              {t('aiSetup.save')}
            </Button>
          </>
        )}
      />

      {!onSave && <ModuleNotice tone="warning">{t('aiSetup.localDraftNotice')}</ModuleNotice>}

      <AiSetupSection title={t('aiSetup.status.title')} description={t('aiSetup.status.description')}>
        <AiToggle
          checked={values.enabled}
          onChange={(enabled) => setValues((current) => ({ ...current, enabled }))}
          disabled={disabled}
          label={t('aiSetup.status.enable')}
          description={t('aiSetup.status.enableDescription')}
        />
      </AiSetupSection>

      <AiSetupSection title={t('aiSetup.capabilities.title')} description={t('aiSetup.capabilities.description')}>
        <AiCapabilityList
          capabilities={capabilities}
          value={values.capabilities}
          onChange={(next) => setValues((current) => ({ ...current, capabilities: next }))}
          disabled={disabled || !values.enabled}
        />
      </AiSetupSection>

      <AiSetupSection title={t('aiSetup.behavior.title')} description={t('aiSetup.behavior.description')}>
        <AiBehaviorFields values={values} onChange={setValues} disabled={disabled || !values.enabled} />
      </AiSetupSection>
    </div>
  )
}
