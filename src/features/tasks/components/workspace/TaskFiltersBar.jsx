import { useTranslation } from 'react-i18next'
import { getTaskableTypes } from '../../constants/taskableTypes'
import { getTaskStatusMeta, getTaskTypeMeta } from '../../utils/taskMeta'

const selectClass = 'h-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-semibold text-[var(--text)]'

/** Status · kind · linked-to filters on one line (labels are the "all" options, so no extra captions). */
export function TaskFiltersBar({ statusOptions, typeOptions, status, type, link, onStatusChange, onTypeChange, onLinkChange }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={status} onChange={(event) => onStatusChange(event.target.value)} aria-label={t('tasks.page.statusFilterLabel')} className={selectClass}>
        <option value="all">{t('activities.form.allStatuses')}</option>
        {statusOptions.map((value) => <option key={value} value={value}>{getTaskStatusMeta(value, t).label}</option>)}
      </select>
      <select value={type} onChange={(event) => onTypeChange(event.target.value)} aria-label={t('tasks.page.typeFilterLabel')} className={selectClass}>
        <option value="all">{t('tasks.page.allTypes')}</option>
        {typeOptions.map((value) => <option key={value} value={value}>{getTaskTypeMeta(value, t).label}</option>)}
      </select>
      <select value={link} onChange={(event) => onLinkChange(event.target.value)} aria-label={t('tasks.taskable.label')} className={selectClass}>
        <option value="all">{t('tasks.list.allLinks')}</option>
        <option value="personal">{t('tasks.taskable.personal')}</option>
        {getTaskableTypes().map((entry) => <option key={entry.id} value={entry.id}>{t(entry.labelKey)}</option>)}
      </select>
      {(status !== 'all' || type !== 'all' || link !== 'all') && (
        <button
          type="button"
          onClick={() => { onStatusChange('all'); onTypeChange('all'); onLinkChange('all') }}
          className="h-8 rounded-lg px-2 text-xs font-black text-[var(--brand-accent)] hover:bg-[var(--brand-accent-soft)]"
        >
          {t('tasks.list.clearFilters')}
        </button>
      )}
    </div>
  )
}
