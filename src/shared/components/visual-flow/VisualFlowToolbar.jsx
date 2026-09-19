import { useTranslation } from 'react-i18next'
import { Redo2, LayoutGrid, CheckCircle2, Map, Maximize, Save, Undo2 } from 'lucide-react'
import { Button } from '../ui/Button'

const DEFAULT_CONFIG = {
  undo: false,
  redo: false,
  layout: false,
  validate: false,
  minimap: false,
  fullscreen: false,
  save: false,
}

/**
 * Every button is opt-in via `toolbar={{...}}` (see docs "Toolbar") —
 * VisualFlow never assumes a workflow-specific action belongs here by
 * default. `capabilities` further gates edit-only buttons even if a
 * consumer asked for them in a readonly instance by mistake.
 */
export function VisualFlowToolbar({
  toolbar = {},
  capabilities,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAutoLayout,
  onValidate,
  onToggleMiniMap,
  onToggleFullscreen,
  onSave,
  isDirty,
  children,
}) {
  const { t } = useTranslation()
  const config = { ...DEFAULT_CONFIG, ...toolbar }

  if (Object.values(config).every((value) => !value) && !children) return null

  return (
    <div className="flex items-center gap-1 border-b border-[var(--border)] bg-[var(--surface)] p-2">
      {config.undo && capabilities?.canUndo && (
        <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} aria-label={t('visualFlow.toolbar.undo')}>
          <Undo2 size={16} />
        </Button>
      )}
      {config.redo && capabilities?.canRedo && (
        <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} aria-label={t('visualFlow.toolbar.redo')}>
          <Redo2 size={16} />
        </Button>
      )}
      {config.layout && (
        <Button variant="ghost" size="icon" onClick={onAutoLayout} aria-label={t('visualFlow.toolbar.autoLayout')}>
          <LayoutGrid size={16} />
        </Button>
      )}
      {config.validate && (
        <Button variant="ghost" size="icon" onClick={onValidate} aria-label={t('visualFlow.toolbar.validate')}>
          <CheckCircle2 size={16} />
        </Button>
      )}
      {config.minimap && (
        <Button variant="ghost" size="icon" onClick={onToggleMiniMap} aria-label={t('visualFlow.toolbar.toggleMinimap')}>
          <Map size={16} />
        </Button>
      )}
      {config.fullscreen && (
        <Button variant="ghost" size="icon" onClick={onToggleFullscreen} aria-label={t('visualFlow.toolbar.fullscreen')}>
          <Maximize size={16} />
        </Button>
      )}
      <div className="flex-1" />
      {children}
      {config.save && (
        <Button size="sm" onClick={onSave} disabled={!isDirty}>
          <Save size={14} />
          {t('visualFlow.toolbar.save')}
        </Button>
      )}
    </div>
  )
}
