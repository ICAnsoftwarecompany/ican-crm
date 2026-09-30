import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Copy, TriangleAlert } from 'lucide-react'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../shared/components/ui/Button'

/** Shows a new API key or webhook secret exactly once. Nothing keeps it after the dialog closes. */
export function OneTimeSecretDialog({ secret, kind = 'key', onClose }) {
  const { t } = useTranslation()
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      toast.success(t('service.apiAccess.copied'))
    } catch {
      toast.error(t('service.apiAccess.copyFailed'))
    }
  }
  return (
    <AppModal isOpen={Boolean(secret)} onClose={onClose} title={t(`service.apiAccess.secret.${kind}Title`)} size="md">
      <div className="grid gap-4">
        <p className="flex items-start gap-2 rounded-lg border border-sla-at-risk bg-[var(--surface-2)] p-3 text-sm text-[var(--text)]">
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-sla-at-risk" aria-hidden="true" />
          {t('service.apiAccess.secret.warning')}
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
          <code dir="ltr" className="min-w-0 flex-1 break-all text-start font-mono text-xs text-[var(--text)]">{secret}</code>
          <Button size="sm" variant="outline" onClick={copy}><Copy size={14} aria-hidden="true" />{t('service.apiAccess.copy')}</Button>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>{t('service.apiAccess.secret.done')}</Button>
        </div>
      </div>
    </AppModal>
  )
}
