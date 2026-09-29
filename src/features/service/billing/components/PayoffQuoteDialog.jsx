import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../shared/components/ui/Button'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { Spinner } from '../../../../shared/components/ui/Spinner'
import { formatDate } from '../../../../shared/utils/dateTime'
import { usePayoffQuote } from '../api/schedulesApi'
import { useMoney } from '../utils/money'

/** Early payoff quote (spec §29.11) — computed by the server, valid for a few days; paying it is a normal payment. */
export function PayoffQuoteDialog({ open, onClose, schedule, onPay }) {
  const { t, i18n } = useTranslation()
  const money = useMoney(schedule.currency)
  const quote = usePayoffQuote()

  useEffect(() => {
    if (open) quote.mutate(schedule.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, schedule.id, schedule.version])

  const data = quote.data
  const rows = data
    ? [
        ['principalRemaining', data.principal_remaining],
        ['interestRebate', -data.interest_rebate],
        ['discount', -data.discount],
        ['lateFees', data.late_fees],
      ]
    : []

  return (
    <AppModal
      isOpen={open}
      onClose={onClose}
      title={t('service.billing.actions.payoffQuote')}
      description={data ? t('service.billing.quoteValidUntil', { date: formatDate(data.valid_until, i18n.language, { dateStyle: 'medium' }) }) : undefined}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>{t('service.billing.close')}</Button>
          {data?.allowed && <Button onClick={() => onPay(data.total)}>{t('service.billing.actions.payQuote')}</Button>}
        </div>
      }
    >
      {quote.isPending ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : quote.isError ? (
        <EmptyState title={t('service.billing.quoteError')} />
      ) : data ? (
        <div className="grid gap-3">
          {!data.allowed && <p className="text-sm text-sla-at-risk">{t('service.billing.payoffNotAllowed')}</p>}
          <dl className="grid gap-2 text-sm">
            {rows.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-2">
                <dt className="text-[var(--text-muted)]">{t(`service.billing.quote.${key}`)}</dt>
                <dd dir="ltr" className="text-[var(--text)]">{money(value)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-2 border-t border-[var(--border)] pt-2 font-bold">
              <dt className="text-[var(--text)]">{t('service.billing.quote.total')}</dt>
              <dd dir="ltr" className="text-[var(--text)]">{money(data.total)}</dd>
            </div>
          </dl>
          {data.outside_price_remaining > 0 && <p className="text-xs text-[var(--text-muted)]">{t('service.billing.quote.outsideNote', { amount: money(data.outside_price_remaining) })}</p>}
        </div>
      ) : null}
    </AppModal>
  )
}
