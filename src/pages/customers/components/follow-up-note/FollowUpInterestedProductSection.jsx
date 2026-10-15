import { useTranslation } from 'react-i18next'
import { LeadInterestFields } from '../../../../features/leads'

/**
 * "Link a product / service" side of the follow-up dialog. Since 2026-10-15 it embeds the catalog interest form
 * (`LeadInterestFields`): pick a product, service, plan or bundle, then the fields its item type needs.
 * `interestState` = `useLeadInterestForm(...)` owned by the dialog, which saves it after the follow-up.
 */
export function FollowUpInterestedProductSection({ enabled, onToggle, interestState }) {
  const { t } = useTranslation()

  return (
    <div className="min-h-0 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-sm font-black text-[var(--text)]">{t('customers.followUp.interest.addLabel')}</span>
          <span className="mt-0.5 block text-xs font-bold text-[var(--text-muted)]">{t('leads.interestDialog.followUpHint')}</span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onToggle(event.target.checked)}
          className="h-5 w-5 shrink-0 rounded border-[#BEEFF2] text-[#00AEB8] focus:ring-[#00C2CB]"
        />
      </label>

      {enabled && (
        <div className="mt-3">
          <LeadInterestFields state={interestState} />
        </div>
      )}
    </div>
  )
}
