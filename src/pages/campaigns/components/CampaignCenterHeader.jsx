import { Menu, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../../../shared/components/ui/Badge'
import { Button } from '../../../shared/components/ui/Button'

export function CampaignCenterHeader({ platform, accounts, accountId, onAccountChange, connectionStatus, onOpenNavigation, onSync, isSyncing, showSync = false }) {
  const { t } = useTranslation()
  const Icon = platform.icon
  const statusVariant = connectionStatus === 'connected' ? 'success' : connectionStatus === 'expired' ? 'warning' : 'default'
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-3 sm:px-4">
      <Button variant="outline" size="icon" className="lg:hidden" onClick={onOpenNavigation} aria-label={t('campaigns.center.openNavigation')}><Menu size={17} /></Button>
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--surface-2)]"><Icon size={18} /></span>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold text-[var(--text)]">{t(platform.labelKey)}</h1>
          <Badge variant={statusVariant}>{t(`campaigns.connection.${connectionStatus}`)}</Badge>
        </div>
      </div>
      {accounts.length > 0 && (
        <label className="ms-auto flex min-w-0 items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="hidden sm:inline">{t('campaigns.center.account')}</span>
          <select value={accountId} onChange={(event) => onAccountChange(event.target.value)} className="h-9 max-w-56 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)]">
            {accounts.map((account) => <option key={account.account_id || account.id} value={account.account_id || account.id}>{account.name || account.account_name || account.account_id || account.id}</option>)}
          </select>
        </label>
      )}
      {showSync && (
        <Button variant="outline" size="sm" onClick={onSync} loading={isSyncing} disabled={connectionStatus !== 'connected'}>
          <RefreshCw size={15} />{t('campaigns.center.sync')}
        </Button>
      )}
    </header>
  )
}
