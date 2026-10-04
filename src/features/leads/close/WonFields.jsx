import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../shared/utils/cn'
import { CloseField, closeInputClass } from './CloseField'
import { DealPicker } from './DealPicker'
import { ReasonChips } from './ReasonChips'

function TargetOption({ active, title, description, onClick, disabled }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-lg border p-3 text-start disabled:cursor-not-allowed disabled:opacity-60',
        active ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
      )}
    >
      <span className="block text-sm font-bold text-[var(--text)]">{title}</span>
      <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{description}</span>
    </button>
  )
}

/**
 * Sale path. Two targets: record the sale here (reason if the status has reasons, interest bought, value, note),
 * or add the lead(s) to a deal instead — the deal then handles the win, contract and payment plan. A lead already
 * in an open deal can only be won from that deal.
 */
export function WonFields({ form, onChange, interests = [], reasons, reasonRequired, err, openDeal, bulk, onStage }) {
  const { t } = useTranslation()
  const open = interests.filter((interest) => !interest.isLost)
  const saleBlocked = bulk || Boolean(openDeal)

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('customers.leadClose.fields.target')}>
        <TargetOption
          active={form.target === 'close'}
          title={t('customers.leadClose.targets.close.title')}
          description={t('customers.leadClose.targets.close.description')}
          onClick={() => onChange({ target: 'close' })}
        />
        <TargetOption
          active={form.target === 'deal'}
          title={t('customers.leadClose.targets.deal.title')}
          description={t('customers.leadClose.targets.deal.description')}
          onClick={() => onChange({ target: 'deal' })}
          disabled={Boolean(openDeal)}
        />
      </div>

      {openDeal && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text)]">
          {t('customers.leadClose.errors.inOpenDeal', { deal: openDeal.dealName })}{' '}
          <Link to={`/deals/${openDeal.dealId}/pipeline`} className="font-semibold text-[var(--brand-accent)] underline">{t('customers.leadClose.openDeal')}</Link>
        </p>
      )}

      {form.target === 'deal' ? (
        <>
          <DealPicker value={form.dealId} onChange={(dealId) => onChange({ dealId })} onStage={onStage} error={err('dealId')} />
          <p className="text-xs leading-5 text-[var(--text-muted)]">{t('customers.leadClose.dealTargetHint')}</p>
        </>
      ) : (
        !saleBlocked && (
          <>
            <ReasonChips reasons={reasons} value={form.reason} onChange={(reason) => onChange({ reason })} required={reasonRequired} error={err('reason')} />
            <div className="grid gap-3 sm:grid-cols-2">
              <CloseField label={t('customers.leadClose.fields.interest')} hint={open.length ? null : t('customers.leadClose.noInterests')}>
                <select className={closeInputClass} value={form.interestId} onChange={(event) => onChange({ interestId: event.target.value })} disabled={!open.length}>
                  <option value="">{t('customers.leadClose.chooseInterest')}</option>
                  {open.map((interest) => <option key={interest.id} value={interest.id}>{interest.name}</option>)}
                </select>
              </CloseField>
              <CloseField label={t('customers.leadClose.fields.value')} error={err('wonValue')}>
                <input type="number" min="0" dir="ltr" className={closeInputClass} value={form.wonValue} onChange={(event) => onChange({ wonValue: event.target.value })} />
              </CloseField>
            </div>
            <CloseField label={t('customers.leadClose.fields.note')}>
              <textarea className={`${closeInputClass} h-20 py-2`} value={form.note} onChange={(event) => onChange({ note: event.target.value })} />
            </CloseField>
          </>
        )
      )}
    </div>
  )
}
