import { useState, useCallback } from 'react'
import { Input } from '../../ui/Input'

export const NumberRangeInput = ({ column, value, onChange }) => {
  const [min, setMin] = useState(value?.value?.from || '')
  const [max, setMax] = useState(value?.value?.to || '')
  const [operator, setOperator] = useState(value?.operator || 'between')

  const handleMinChange = useCallback((e) => {
    const val = e.target.value
    setMin(val)
    if (val && operator === 'between' && max) {
      onChange({ type: 'number', operator: 'between', value: { from: Number(val), to: Number(max) } })
    } else if (val && operator !== 'between') {
      onChange({ type: 'number', operator, value: Number(val) })
    }
  }, [max, operator, onChange])

  const handleMaxChange = useCallback((e) => {
    const val = e.target.value
    setMax(val)
    if (min && operator === 'between' && val) {
      onChange({ type: 'number', operator: 'between', value: { from: Number(min), to: Number(val) } })
    }
  }, [min, operator, onChange])

  const handleOperatorChange = useCallback((e) => {
    const newOperator = e.target.value
    setOperator(newOperator)
    if (newOperator === 'between' && min && max) {
      onChange({ type: 'number', operator: 'between', value: { from: Number(min), to: Number(max) } })
    } else if (newOperator !== 'between' && min) {
      onChange({ type: 'number', operator: newOperator, value: Number(min) })
    }
  }, [min, max, onChange])

  const handleClear = useCallback(() => {
    setMin('')
    setMax('')
    setOperator('between')
    onChange(null)
  }, [onChange])

  return (
    <div className="flex flex-col gap-1">
      <select
        value={operator}
        onChange={handleOperatorChange}
        className="h-8 px-2 rounded border border-gray-300 text-xs bg-white"
        title={`Filter operator for ${column.header}`}
      >
        <option value="equals">يساوي</option>
        <option value="greater_than">&gt;</option>
        <option value="less_than">&lt;</option>
        <option value="between">بين</option>
      </select>
      <div className="flex gap-1">
        {operator === 'between' ? (
          <>
            <Input
              type="number"
              value={min}
              onChange={handleMinChange}
              placeholder="من"
              className="h-8 px-2 text-xs flex-1"
              title={`Minimum value for ${column.header}`}
            />
            <Input
              type="number"
              value={max}
              onChange={handleMaxChange}
              placeholder="إلى"
              className="h-8 px-2 text-xs flex-1"
              title={`Maximum value for ${column.header}`}
            />
          </>
        ) : (
          <Input
            type="number"
            value={min}
            onChange={handleMinChange}
            placeholder={column.header}
            className="h-8 px-2 text-xs flex-1"
            title={`Enter value to filter by ${column.header}`}
          />
        )}
        {(min || max) && (
          <button
            onClick={handleClear}
            className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded"
            title="Clear filter"
          >
            مسح
          </button>
        )}
      </div>
    </div>
  )
}
