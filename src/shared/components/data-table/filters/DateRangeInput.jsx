import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const getDatePreset = (preset) => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const date = String(today.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${date}`

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const monthStart = `${year}-${month}-01`

  const yearStart = `${year}-01-01`

  switch (preset) {
    case 'today':
      return { from: todayStr, to: todayStr }
    case 'yesterday':
      return { from: yesterdayStr, to: yesterdayStr }
    case 'this_week':
      return { from: weekStartStr, to: todayStr }
    case 'this_month':
      return { from: monthStart, to: todayStr }
    case 'this_year':
      return { from: yearStart, to: todayStr }
    default:
      return { from: '', to: '' }
  }
}

export const DateRangeInput = ({ column, value, onChange }) => {
  const { t } = useTranslation()
  const [from, setFrom] = useState(value?.value?.from || '')
  const [to, setTo] = useState(value?.value?.to || '')
  const [operator, setOperator] = useState(value?.operator || 'between')

  const handleFromChange = useCallback((e) => {
    const val = e.target.value
    setFrom(val)
    if (operator === 'between' && val && to) {
      onChange({ type: 'date', operator: 'between', value: { from: val, to } })
    } else if (operator !== 'between' && val) {
      onChange({ type: 'date', operator, value: val })
    }
  }, [to, operator, onChange])

  const handleToChange = useCallback((e) => {
    const val = e.target.value
    setTo(val)
    if (operator === 'between' && from && val) {
      onChange({ type: 'date', operator: 'between', value: { from, to: val } })
    }
  }, [from, operator, onChange])

  const handleOperatorChange = useCallback((e) => {
    const newOperator = e.target.value
    setOperator(newOperator)
    if (newOperator === 'between' && from && to) {
      onChange({ type: 'date', operator: 'between', value: { from, to } })
    } else if (newOperator !== 'between' && from) {
      onChange({ type: 'date', operator: newOperator, value: from })
    }
  }, [from, to, onChange])

  const handlePreset = useCallback((preset) => {
    const dates = getDatePreset(preset)
    setFrom(dates.from)
    setTo(dates.to)
    onChange({ type: 'date', operator: 'between', value: dates })
  }, [onChange])

  const handleClear = useCallback(() => {
    setFrom('')
    setTo('')
    setOperator('between')
    onChange(null)
  }, [onChange])

  return (
    <div className="flex flex-col gap-1">
      <select
        value={operator}
        onChange={handleOperatorChange}
        className="h-8 px-2 rounded border border-gray-300 text-xs bg-white"
        title={t('dataTable.dateFilter.operatorFor', { column: column.header })}
      >
        <option value="equals">{t('dataTable.operators.equals')}</option>
        <option value="before">{t('dataTable.operators.before')}</option>
        <option value="after">{t('dataTable.operators.after')}</option>
        <option value="between">{t('dataTable.operators.between')}</option>
      </select>
      {operator === 'between' ? (
        <>
          <div className="flex gap-1">
            <input
              type="date"
              value={from}
              onChange={handleFromChange}
              className="h-8 px-2 text-xs flex-1 rounded border border-gray-300"
              title={t('dataTable.dateFilter.startDate')}
            />
            <input
              type="date"
              value={to}
              onChange={handleToChange}
              className="h-8 px-2 text-xs flex-1 rounded border border-gray-300"
              title={t('dataTable.dateFilter.endDate')}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => handlePreset('today')}
              className="px-1 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              title={t('dataTable.dateFilter.today')}
            >
              {t('dataTable.dateFilter.today')}
            </button>
            <button
              onClick={() => handlePreset('this_week')}
              className="px-1 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              title={t('dataTable.dateFilter.thisWeek')}
            >
              {t('dataTable.dateFilter.thisWeek')}
            </button>
            <button
              onClick={() => handlePreset('this_month')}
              className="px-1 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              title={t('dataTable.dateFilter.thisMonth')}
            >
              {t('dataTable.dateFilter.thisMonth')}
            </button>
            <button
              onClick={() => handlePreset('this_year')}
              className="px-1 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              title={t('dataTable.dateFilter.thisYear')}
            >
              {t('dataTable.dateFilter.thisYear')}
            </button>
            {(from || to) && (
              <button
                onClick={handleClear}
                className="px-1 py-0.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded"
                title={t('dataTable.clearAll')}
              >
                {t('dataTable.dateFilter.clear')}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="flex gap-1">
          <input
            type="date"
            value={from}
            onChange={handleFromChange}
            className="h-8 px-2 text-xs flex-1 rounded border border-gray-300"
            title={t('dataTable.dateFilter.selectDateFor', { column: column.header })}
          />
          {from && (
            <button
              onClick={handleClear}
              className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded"
              title={t('dataTable.clearAll')}
            >
              {t('dataTable.dateFilter.clear')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
