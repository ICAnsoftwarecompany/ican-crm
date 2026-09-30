import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react'

import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { PIPELINE_CARD_FIELDS } from '../constants'

const LABEL_KEYS = new Map(PIPELINE_CARD_FIELDS.map((field) => [field.id, field.labelKey]))

function MoveButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  )
}

/** Pipeline-only settings: choose and order the lead fields shown on each card. */
export function PipelineCardSettingsDrawer({ open, onClose, fields = [], onToggle, onMove, onReset }) {
  const { t } = useTranslation()

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={t('customers.pipeline.settings.title')}
      description={t('customers.pipeline.settings.description')}
      drawerKey="customers-pipeline-settings"
      size="sm"
      pushPage={false}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[var(--text-muted)]">{t('customers.pipeline.settings.nameAlwaysShown')}</p>
        <Button variant="ghost" size="sm" onClick={onReset} className="shrink-0 gap-1">
          <RotateCcw size={14} />
          {t('customers.pipeline.settings.reset')}
        </Button>
      </div>
      <ul className="space-y-1">
        {fields.map((field, index) => {
          const label = t(LABEL_KEYS.get(field.id))
          return (
            <li
              key={field.id}
              className={cn(
                'flex items-center gap-2 rounded-lg border border-[var(--border)] px-2 py-1.5',
                field.visible ? 'bg-[var(--surface)]' : 'bg-[var(--surface-2)]'
              )}
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={field.visible}
                  onChange={() => onToggle?.(field.id)}
                  className="h-4 w-4 shrink-0 accent-[var(--brand-accent)]"
                />
                <span className={cn('truncate', !field.visible && 'text-[var(--text-muted)]')}>{label}</span>
              </label>
              <MoveButton label={t('customers.pipeline.settings.moveUp', { field: label })} disabled={index === 0} onClick={() => onMove?.(field.id, -1)}>
                <ArrowUp size={14} />
              </MoveButton>
              <MoveButton label={t('customers.pipeline.settings.moveDown', { field: label })} disabled={index === fields.length - 1} onClick={() => onMove?.(field.id, 1)}>
                <ArrowDown size={14} />
              </MoveButton>
            </li>
          )
        })}
      </ul>
    </AppDrawer>
  )
}
