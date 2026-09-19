import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { Check, Lock, RotateCcw, SlidersHorizontal, Unlock } from 'lucide-react'
import { cn } from '../../utils/cn'

const BG_COLORS = ['#FFFFFF', '#FEF3C7', '#DBEAFE', '#DCFCE7', '#FCE7F3', '#E2E8F0', '#FEE2E2']
const TEXT_COLORS = ['#0F172A', '#1D4ED8', '#047857', '#B45309', '#BE185D', '#374151', '#7C3AED']
const FONT_FAMILIES = [
  { label: 'Default', value: 'inherit' },
  { label: 'Cairo', value: 'Cairo, sans-serif' },
  { label: 'Tajawal', value: 'Tajawal, sans-serif' },
  { label: 'Monospace', value: "'Courier New', monospace" },
]

export function TableStyleCustomizer({
  visibility,
  style,
  onStyleChange,
  onSave,
  onReset,
  onToggleVisibility,
  isSaving = false,
}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const [panelStyle, setPanelStyle] = useState(null)
  const isPersonal = visibility === 'personal'

  useEffect(() => {
    if (!isOpen) return undefined

    const handleClickAway = (event) => {
      if (triggerRef.current?.contains(event.target)) return
      if (panelRef.current?.contains(event.target)) return
      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickAway)
    return () => document.removeEventListener('mousedown', handleClickAway)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const updatePanelPosition = () => {
      const trigger = triggerRef.current
      if (!trigger || typeof window === 'undefined') return

      const rect = trigger.getBoundingClientRect()
      const width = Math.min(window.innerWidth - 24, 288)
      const left = Math.min(Math.max(rect.right - width, 12), window.innerWidth - width - 12)

      setPanelStyle({
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: 9999,
      })
    }

    updatePanelPosition()
    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)

    return () => {
      window.removeEventListener('resize', updatePanelPosition)
      window.removeEventListener('scroll', updatePanelPosition, true)
    }
  }, [isOpen])

  const updateStyle = (patch) => {
    onStyleChange({
      ...style,
      ...patch,
    })
  }

  const panel = isOpen && typeof document !== 'undefined'
    ? createPortal(
      <div
        ref={panelRef}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl"
        style={panelStyle || { position: 'fixed', top: 0, left: 0, width: 288, zIndex: 9999 }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-bold text-[var(--text)]">{t('dataTable.style.title')}</div>
            <div className="text-xs text-[var(--text-muted)]">
              {isPersonal ? t('dataTable.style.personalMode') : t('dataTable.style.sharedMode')}
            </div>
          </div>
          <span
            className={cn(
              'rounded-full px-2 py-1 text-[11px] font-semibold',
              isPersonal ? 'bg-[#E8F9FA] text-[#007A80]' : 'bg-blue-50 text-blue-700'
            )}
          >
            {isPersonal ? t('dataTable.style.personal') : t('dataTable.style.shared')}
          </span>
        </div>

        <div className="space-y-3">
          <label className="grid gap-1 text-xs font-medium text-[var(--text)]">
            {t('dataTable.fontSize')}
            <select
              className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
              value={style.fontSize || '14px'}
              onChange={(event) => updateStyle({ fontSize: event.target.value })}
            >
              <option value="12px">12</option>
              <option value="13px">13</option>
              <option value="14px">14</option>
              <option value="16px">16</option>
              <option value="18px">18</option>
            </select>
          </label>

          <label className="grid gap-1 text-xs font-medium text-[var(--text)]">
            {t('dataTable.fontWeight')}
            <select
              className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
              value={style.fontWeight || '500'}
              onChange={(event) => updateStyle({ fontWeight: event.target.value })}
            >
              <option value="400">{t('dataTable.normal')}</option>
              <option value="500">{t('dataTable.medium')}</option>
              <option value="600">{t('dataTable.semibold')}</option>
              <option value="700">{t('dataTable.bold')}</option>
            </select>
          </label>

          <label className="grid gap-1 text-xs font-medium text-[var(--text)]">
            {t('dataTable.fontFamily')}
            <select
              className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
              value={style.fontFamily || 'inherit'}
              onChange={(event) => updateStyle({ fontFamily: event.target.value })}
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.label} value={font.value}>{font.label === 'Default' ? t('dataTable.defaultFont') : font.label === 'Monospace' ? t('dataTable.monospace') : font.label}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-1">
            <div className="text-xs font-medium text-[var(--text)]">{t('dataTable.rowColor')}</div>
            <div className="flex flex-wrap gap-1.5">
              {BG_COLORS.map((color) => (
                <button
                  key={`table-bg-${color}`}
                  type="button"
                  className={cn(
                    'h-6 w-6 rounded-md border border-slate-300',
                    style.bgColor === color && 'ring-2 ring-[#00C2CB] ring-offset-1'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => updateStyle({ bgColor: color })}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-1">
            <div className="text-xs font-medium text-[var(--text)]">{t('dataTable.textColor')}</div>
            <div className="flex flex-wrap gap-1.5">
              {TEXT_COLORS.map((color) => (
                <button
                  key={`table-text-${color}`}
                  type="button"
                  className={cn(
                    'h-6 w-6 rounded-md border border-slate-300',
                    style.textColor === color && 'ring-2 ring-[#00C2CB] ring-offset-1'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => updateStyle({ textColor: color })}
                  title={color}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#162847] px-3 text-sm font-semibold text-white hover:bg-[#1D3461] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={16} />
            {isSaving ? t('dataTable.style.saving') : t('dataTable.style.save', { mode: isPersonal ? t('dataTable.style.personal') : t('dataTable.style.shared') })}
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            title={t('dataTable.style.resetHint')}
          >
            <RotateCcw size={16} />
            {t('dataTable.style.reset')}
          </button>
        </div>
      </div>,
      document.body
    )
    : null

  return (
    <div ref={triggerRef} className="relative flex min-w-0 items-center gap-1">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]"
        title={t('dataTable.style.customize')}
        aria-label={t('dataTable.style.customize')}
      >
        <SlidersHorizontal size={16} />
      </button>

      <button
        type="button"
        onClick={onToggleVisibility}
        className={cn(
          'h-9 w-9 inline-flex items-center justify-center rounded-lg border text-[var(--text)] hover:bg-[var(--surface-2)]',
          isPersonal
            ? 'border-[#00C2CB] bg-[#E8F9FA]'
            : 'border-[var(--border)] bg-[var(--surface)]'
        )}
        title={isPersonal ? t('dataTable.style.personalHint') : t('dataTable.style.sharedHint')}
        aria-label={isPersonal ? t('dataTable.style.personalMode') : t('dataTable.style.sharedMode')}
      >
        {isPersonal ? <Lock size={16} /> : <Unlock size={16} />}
      </button>

      {panel}
    </div>
  )
}
