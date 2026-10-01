import { useTranslation } from 'react-i18next'
import { CheckCircle2, CloudOff, FileStack, Loader2, Save } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { formatRelativeTime } from '../../../../../shared/utils/dateTime'
import { formatAccountOffset } from '../../domain/accountTime'

export function WizardHeader({ title, account, saveStatus, lastSavedAt, dirty, onSave, onOpenDrafts, completion }) {
  const { t, i18n } = useTranslation()
  const status = dirty ? 'unsaved' : saveStatus === 'failed' ? 'failed' : lastSavedAt ? 'saved' : 'new'
  const StatusIcon = { unsaved: Loader2, failed: CloudOff, saved: CheckCircle2, new: Save }[status]

  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold text-[var(--text)]">{title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
          {account.name && <span>{t('campaignWizard.header.account', { name: account.name })}</span>}
          <span dir="ltr" title={account.currencyIsFallback ? t('campaignWizard.header.currencyFallback') : undefined}>
            {account.currency}{account.currencyIsFallback ? '*' : ''} · {account.timezone} ({formatAccountOffset(account.timezone)})
          </span>
          <span className="flex items-center gap-1">
            <StatusIcon size={12} className={status === 'unsaved' ? 'animate-spin' : ''} />
            {status === 'saved' ? t('campaignWizard.header.savedAt', { time: formatRelativeTime(lastSavedAt, i18n.language) }) : t(`campaignWizard.header.saveStatus.${status}`)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex" title={t('campaignWizard.header.completion')}>
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--border)]">
            <span className="block h-full rounded-full bg-[var(--brand-accent)] transition-all" style={{ width: `${completion}%` }} />
          </span>
          <span className="text-xs font-bold text-[var(--text-muted)]" dir="ltr">{completion}%</span>
        </div>
        <Button variant="outline" size="sm" onClick={onOpenDrafts} className="lg:hidden"><FileStack size={14} />{t('campaignWizard.drafts.title')}</Button>
        <Button variant="outline" size="sm" onClick={onSave}><Save size={14} />{t('campaignWizard.header.saveDraft')}</Button>
      </div>
    </header>
  )
}
