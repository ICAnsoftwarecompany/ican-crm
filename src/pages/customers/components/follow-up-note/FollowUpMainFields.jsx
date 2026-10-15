import { useTranslation } from 'react-i18next'
import { CalendarClock, CheckCircle2, ChevronDown } from 'lucide-react'
import { isClosingStatus } from '../../../../features/leads'
import { Input } from '../../../../shared/components/ui/Input'

export function getStatusLabel(status) {
  return status?.status || status?.name || status?.title || ''
}

export function isStatusNoteRequired(status) {
  return Number(status?.has_resone ?? status?.has_reason ?? 0) === 1
}

function getResultOptions(t) {
  return [
    { value: '', label: t('customers.followUp.results.none') },
    { value: 'no_answer', label: t('customers.followUp.results.noAnswer') },
    { value: 'answered', label: t('customers.followUp.results.answered') },
    { value: 'interested', label: t('customers.followUp.results.interested') },
    { value: 'not_interested', label: t('customers.followUp.results.notInterested') },
    { value: 'follow_up', label: t('customers.followUp.results.followUpLater') },
  ]
}

const selectClass = 'h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-arabic text-[var(--text)] outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]'

/**
 * Main column of the follow-up dialog (moved out of FollowUpNoteDialog 2026-10-15): follow-up, note, short note,
 * duration + result, time, status change. `quick` (the "quick follow-up" mode) keeps only follow-up, note, time and
 * short note.
 */
export function FollowUpMainFields({ form, setForm, updateForm, statuses, selectedStatus, oldStatusTitle, quick }) {
  const { t } = useTranslation()

  return (
    <div className="min-h-0 space-y-4 overflow-y-auto pe-1">
      <Input
        type="text"
        label={t('customers.followUp.statusFieldLabel')}
        value={form.title}
        onChange={(event) => updateForm('title', event.target.value)}
        placeholder={oldStatusTitle || t('customers.followUp.defaultTitle')}
      />

      <label className="block">
        <span className="mb-1.5 block text-sm font-black text-[var(--text)]">{t('customers.followUp.noteTextLabel')}</span>
        <textarea
          value={form.description}
          onChange={(event) => updateForm('description', event.target.value)}
          rows={quick ? 4 : 5}
          className="min-h-28 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
          placeholder={t('customers.followUp.notePlaceholder')}
          autoFocus
        />
      </label>

      <Input
        type="datetime-local"
        label={t('customers.followUp.activityTimeLabel')}
        value={form.activity_at}
        onChange={(event) => updateForm('activity_at', event.target.value)}
        startIcon={<CalendarClock size={16} />}
      />

      <Input
        type="text"
        label={t('customers.followUp.shortNoteLabel')}
        value={form.note}
        onChange={(event) => updateForm('note', event.target.value)}
        placeholder={t('customers.followUp.optionalPlaceholder')}
      />

      {!quick && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="number"
              min="0"
              label={t('customers.followUp.durationLabel')}
              value={form.duration}
              onChange={(event) => updateForm('duration', event.target.value)}
              placeholder="15"
            />
            <label className="grid gap-1.5">
              <span className="text-sm font-medium font-arabic text-[var(--text)]">{t('customers.followUp.resultLabel')}</span>
              <select value={form.result} onChange={(event) => updateForm('result', event.target.value)} className={selectClass}>
                {getResultOptions(t).map((option) => (
                  <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-sm font-black text-[var(--text)]">{t('customers.followUp.changeStatusQuestion')}</span>
                <span className="mt-0.5 block text-xs font-bold text-[var(--text-muted)]">{t('customers.followUp.changeStatusHint')}</span>
              </span>
              <input
                type="checkbox"
                checked={form.shouldChangeStatus}
                onChange={(event) => {
                  const checked = event.target.checked
                  setForm((current) => ({ ...current, shouldChangeStatus: checked, new_status_id: checked ? current.new_status_id : '' }))
                }}
                className="h-5 w-5 rounded border-[#BEEFF2] text-[#00AEB8] focus:ring-[#00C2CB]"
              />
            </label>

            {form.shouldChangeStatus && (
              <div className="mt-3 grid gap-2">
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium font-arabic text-[var(--text)]">{t('customers.followUp.newStatusLabel')}</span>
                  <div className="relative">
                    <select value={form.new_status_id} onChange={(event) => updateForm('new_status_id', event.target.value)} className={`${selectClass} appearance-none pe-9`}>
                      <option value="">{t('customers.followUp.chooseStatusPlaceholder')}</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id} disabled={isClosingStatus(status)}>
                          {isClosingStatus(status)
                            ? `${getStatusLabel(status)} — ${t('customers.leadClose.useCloseDialog')}`
                            : `${getStatusLabel(status)}${isStatusNoteRequired(status) ? t('customers.followUp.noteRequiredSuffix') : ''}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  </div>
                </label>

                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                  <span className="rounded-full bg-[var(--surface)] px-2 py-1 ring-1 ring-[var(--border)]">
                    {t('customers.followUp.currentStatusLabel', { status: oldStatusTitle || '-' })}
                  </span>
                  {selectedStatus && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF3] px-2 py-1 text-[#166534] ring-1 ring-[#BBF7D0] dark:bg-emerald-950 dark:text-emerald-200">
                      <CheckCircle2 size={13} />
                      {t('customers.followUp.willChangeTo', { status: getStatusLabel(selectedStatus) })}
                      {isStatusNoteRequired(selectedStatus) ? t('customers.followUp.noteRequiredSuffix') : ''}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
