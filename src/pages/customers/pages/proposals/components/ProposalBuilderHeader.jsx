import { useTranslation } from 'react-i18next'
import { ArrowRight, Eye, Save, Settings, WalletCards } from 'lucide-react'

import { Button } from '../../../../../shared/components/ui/Button'
import { formatMoney } from '../utils/proposalPayloads'

export function ProposalBuilderHeader({
  proposal,
  currentVersion,
  saveState,
  onBack,
  onPreview,
  onCreateVersion,
  onSaveNow,
  creatingVersion,
}) {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label={t('proposals.header.back')}>
            <ArrowRight size={18} />
          </Button>
          <div className="min-w-0">
            <div className="truncate text-base font-black text-[var(--text)]">{proposal?.title || t('proposals.builder.defaults.coverEyebrow')}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
              <span>{currentVersion?.name || t('proposals.header.noVersion')}</span>
              <span>•</span>
              <span>{saveState}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE8F3] bg-[#F8FAFC] px-3 py-1.5 text-xs font-black text-[#162847]" dir="ltr">
            <WalletCards size={15} />
            {formatMoney(currentVersion?.total, proposal?.currency)}
          </span>
          {currentVersion ? (
            <Button variant="outline" size="sm" onClick={onSaveNow}>
              <Save size={16} />
              {t('proposals.header.saveNow')}
            </Button>
          ) : (
            <Button variant="accent" size="sm" onClick={onCreateVersion} loading={creatingVersion}>
              <Settings size={16} />
              {t('proposals.header.createVersion')}
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onPreview}>
            <Eye size={16} />
            {t('proposals.page.preview')}
          </Button>
        </div>
      </div>
    </header>
  )
}
