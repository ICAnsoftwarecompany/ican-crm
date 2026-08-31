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
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="رجوع">
            <ArrowRight size={18} />
          </Button>
          <div className="min-w-0">
            <div className="truncate text-base font-black text-[var(--text)]">{proposal?.title || 'عرض سعر'}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
              <span>{currentVersion?.name || 'بدون نسخة'}</span>
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
              حفظ الآن
            </Button>
          ) : (
            <Button variant="accent" size="sm" onClick={onCreateVersion} loading={creatingVersion}>
              <Settings size={16} />
              إنشاء نسخة
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onPreview}>
            <Eye size={16} />
            معاينة
          </Button>
        </div>
      </div>
    </header>
  )
}
