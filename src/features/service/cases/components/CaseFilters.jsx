import { useTranslation } from 'react-i18next'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { CASE_PRIORITIES } from '../constants/caseViews'

/** Server-side filters (priority, queue, type) in one row; values come from the case setup. */
export function CaseFilters({ setup, values, onChange }) {
  const { t, i18n } = useTranslation()
  const labeled = (items = [], fallbackKey = 'key') =>
    items.map((item) => ({ value: item.id, label: localizeLabel(item.label, i18n.language, item[fallbackKey]) }))

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <Select
        aria-label={t('service.cases.fields.priority')}
        placeholder={t('service.cases.filters.anyPriority')}
        value={values.priority}
        onChange={(value) => onChange({ priority: value })}
        options={CASE_PRIORITIES.map((value) => ({ value, label: t(`service.cases.priority.${value}`) }))}
      />
      <Select
        aria-label={t('service.cases.fields.queue')}
        placeholder={t('service.cases.filters.anyQueue')}
        value={values.queue}
        onChange={(value) => onChange({ queue: value })}
        options={labeled(setup?.queues)}
      />
      <Select
        aria-label={t('service.cases.fields.type')}
        placeholder={t('service.cases.filters.anyType')}
        value={values.type}
        onChange={(value) => onChange({ type: value })}
        options={labeled(setup?.case_types)}
      />
    </div>
  )
}
