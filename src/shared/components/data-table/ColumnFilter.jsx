import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { FILTER_OPERATORS } from './constants'

export function ColumnFilter({
  column,
  onApplyFilter,
  onClose,
}) {
  const [operator, setOperator] = useState(
    FILTER_OPERATORS[column.filterType]?.[0]?.value || 'equals'
  )
  const [value, setValue] = useState('')
  const [valueFrom, setValueFrom] = useState('')
  const [valueTo, setValueTo] = useState('')

  const handleApply = () => {
    const filter = {
      type: column.filterType,
      operator,
      value: column.filterType === 'select' && operator === 'in'
        ? value.split(',').map(v => v.trim())
        : column.filterType === 'date' && operator === 'between'
        ? { from: valueFrom, to: valueTo }
        : column.filterType === 'number' && operator === 'between'
        ? { from: Number(valueFrom), to: Number(valueTo) }
        : value,
    }
    onApplyFilter(filter)
    onClose()
  }

  const isBetween = operator === 'between'
  const operators = FILTER_OPERATORS[column.filterType] || []

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-lg space-y-3">
      <h4 className="font-bold font-arabic">{column.header}</h4>

      <div>
        <label className="block text-sm font-medium mb-1 font-arabic">المعامل</label>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
        >
          {operators.map(op => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {!isBetween && (
        <div>
          <label className="block text-sm font-medium mb-1 font-arabic">القيمة</label>
          {column.filterType === 'select' ? (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
            >
              <option value="">اختر</option>
              {column.filterOptions?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : column.filterType === 'date' ? (
            <input
              type="date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
            />
          ) : column.filterType === 'number' ? (
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="أدخل رقم"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="أدخل نصاً"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
            />
          )}
        </div>
      )}

      {isBetween && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1 font-arabic">من</label>
            <input
              type={column.filterType === 'date' ? 'date' : 'number'}
              value={valueFrom}
              onChange={(e) => setValueFrom(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-gray-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 font-arabic">إلى</label>
            <input
              type={column.filterType === 'date' ? 'date' : 'number'}
              value={valueTo}
              onChange={(e) => setValueTo(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-gray-300 text-sm"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          إلغاء
        </Button>
        <Button variant="primary" size="sm" onClick={handleApply}>
          تطبيق
        </Button>
      </div>
    </div>
  )
}
