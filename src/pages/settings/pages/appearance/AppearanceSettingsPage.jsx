import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Save, Sparkles } from 'lucide-react'
import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { StatusBadge } from '../../../../shared/components/ui/StatusBadge'
import { useAppearanceSettings } from '../../../../features/branding'

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/

function normalizeHex(raw) {
  const trimmed = raw.trim()
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

function HexColorField({ label, hint, value, onChange, hexAriaLabel, pickerAriaLabel }) {
  const [text, setText] = useState(value)

  // Keep the text mirror in sync when the value changes from elsewhere
  // (Reset, or the native color picker itself).
  useEffect(() => {
    setText(value)
  }, [value])

  const handleTextChange = (event) => {
    const raw = event.target.value
    setText(raw)
    const candidate = normalizeHex(raw)
    if (HEX_PATTERN.test(candidate)) {
      onChange(candidate.toUpperCase())
    }
  }

  const handlePickerChange = (event) => {
    const hex = event.target.value.toUpperCase()
    setText(hex)
    onChange(hex)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Input
        label={label}
        hint={hint}
        value={text}
        onChange={handleTextChange}
        aria-label={hexAriaLabel}
        endIcon={
          <span
            className="h-4 w-4 rounded-full border border-[var(--border)]"
            style={{ backgroundColor: HEX_PATTERN.test(normalizeHex(text)) ? normalizeHex(text) : value }}
          />
        }
      />
      <input
        type="color"
        value={value}
        onChange={handlePickerChange}
        className="h-9 w-20 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)] p-1"
        aria-label={pickerAriaLabel}
      />
    </div>
  )
}

export function AppearanceSettingsPage() {
  const { t } = useTranslation()
  const {
    brandPrimary,
    brandAccent,
    isDefault,
    setBrandPrimary,
    setBrandAccent,
    handleSave,
    handleReset,
  } = useAppearanceSettings()

  return (
    <div>
      <PageToolbar
        title={t('branding.appearance.page.title')}
        description={t('branding.appearance.page.description')}
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr] lg:items-start">
        <div className="flex flex-col gap-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <HexColorField
            label={t('branding.appearance.fields.primary.label')}
            hint={t('branding.appearance.fields.primary.hint')}
            value={brandPrimary}
            onChange={setBrandPrimary}
            hexAriaLabel={t('branding.appearance.fields.primary.hexAriaLabel')}
            pickerAriaLabel={t('branding.appearance.fields.primary.pickerAriaLabel')}
          />

          <HexColorField
            label={t('branding.appearance.fields.accent.label')}
            hint={t('branding.appearance.fields.accent.hint')}
            value={brandAccent}
            onChange={setBrandAccent}
            hexAriaLabel={t('branding.appearance.fields.accent.hexAriaLabel')}
            pickerAriaLabel={t('branding.appearance.fields.accent.pickerAriaLabel')}
          />

          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
            <Button variant="primary" onClick={handleSave}>
              <Save size={16} />
              {t('branding.appearance.actions.save')}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isDefault}>
              <RotateCcw size={16} />
              {t('branding.appearance.actions.reset')}
            </Button>
          </div>

          <p className="text-xs leading-5 text-[var(--text-muted)]">
            {t('branding.appearance.persistenceNote')}
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="mb-4 text-sm font-bold text-[var(--text)]">
            {t('branding.appearance.preview.title')}
          </h2>

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">{t('branding.appearance.preview.buttonPrimary')}</Button>
              <Button variant="accent">{t('branding.appearance.preview.buttonAccent')}</Button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge statusKey="new" />
                <StatusBadge statusKey="qualified" />
                <StatusBadge statusKey="won" />
              </div>
              <p className="text-xs leading-5 text-[var(--text-muted)]">
                {t('branding.appearance.preview.statusNote')}
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-ai bg-ai p-3">
              <Sparkles size={18} className="mt-0.5 shrink-0 text-ai" />
              <div>
                <p className="text-sm font-semibold text-ai">{t('branding.appearance.preview.ai.title')}</p>
                <p className="mt-1 text-sm leading-6 text-ai">{t('branding.appearance.preview.ai.body')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
