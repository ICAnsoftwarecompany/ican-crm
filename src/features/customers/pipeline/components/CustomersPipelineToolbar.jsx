import { useTranslation } from 'react-i18next'
import { Hand, Search, Settings2, X } from 'lucide-react'

import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'

export function CustomersPipelineToolbar({
  search,
  onSearchChange,
  visibleCount,
  selectedCount,
  onClearSelection,
  onOpenSettings,
  children,
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
      <div className="w-full sm:w-72">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('customers.pipeline.searchPlaceholder')}
          aria-label={t('customers.pipeline.searchPlaceholder')}
          startIcon={<Search size={15} />}
          className="h-9"
        />
      </div>
      <span className="text-xs font-semibold text-[var(--text-muted)]">
        {t('customers.pipeline.shownCount', { count: visibleCount })}
      </span>
      <span className="hidden items-center gap-1 text-xs text-[var(--text-muted)] md:inline-flex">
        <Hand size={13} aria-hidden="true" />
        {t('customers.pipeline.dragHint')}
      </span>
      {selectedCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="gap-1">
          <X size={14} />
          {t('customers.pipeline.clearSelection', { count: selectedCount })}
        </Button>
      )}
      <div className="ms-auto flex min-w-0 flex-wrap items-center gap-2">
        {children}
        <Button variant="outline" size="sm" onClick={onOpenSettings} className="gap-2">
          <Settings2 size={15} />
          <span className="hidden sm:inline">{t('customers.pipeline.settings.button')}</span>
        </Button>
      </div>
    </div>
  )
}
