import { useState, useCallback } from 'react'

export const SelectFilterInput = ({ column, value, onChange }) => {
  const [selectedValues, setSelectedValues] = useState(
    value?.value ? (Array.isArray(value.value) ? value.value : [value.value]) : []
  )
  const [isMulti, setIsMulti] = useState(value?.operator === 'in')

  const handleSelectChange = useCallback((e) => {
    const val = e.target.value
    if (!val) {
      onChange(null)
      setSelectedValues([])
      return
    }

    const newValues = isMulti ? [...selectedValues, val] : [val]
    setSelectedValues(newValues)
    onChange({
      type: 'select',
      operator: isMulti ? 'in' : 'equals',
      value: isMulti ? newValues : val,
    })
  }, [selectedValues, isMulti, onChange])

  const handleRemoveValue = useCallback((val) => {
    const newValues = selectedValues.filter(v => v !== val)
    setSelectedValues(newValues)
    if (newValues.length === 0) {
      onChange(null)
    } else {
      onChange({
        type: 'select',
        operator: 'in',
        value: newValues,
      })
    }
  }, [selectedValues, onChange])

  const handleModeToggle = useCallback((e) => {
    const newIsMulti = e.target.checked
    setIsMulti(newIsMulti)
    if (selectedValues.length > 0) {
      onChange({
        type: 'select',
        operator: newIsMulti ? 'in' : 'equals',
        value: newIsMulti ? selectedValues : selectedValues[0],
      })
    }
  }, [selectedValues, onChange])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <select
          value=""
          onChange={handleSelectChange}
          className="flex-1 h-8 px-2 rounded border border-gray-300 text-xs bg-white"
          title={`Select value to filter by ${column.header}`}
        >
          <option value="">اختر...</option>
          {column.filterOptions?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {column.filterOptions && column.filterOptions.length > 1 && (
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={isMulti}
              onChange={handleModeToggle}
              title="Enable multi-select"
              className="w-3 h-3"
            />
            <span>متعدد</span>
          </label>
        )}
      </div>
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedValues.map(val => {
            const option = column.filterOptions?.find(opt => opt.value === val)
            return (
              <div
                key={val}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
              >
                <span>{option?.label || val}</span>
                <button
                  onClick={() => handleRemoveValue(val)}
                  className="ml-1 font-bold cursor-pointer hover:text-blue-600"
                  title={`Remove ${option?.label || val}`}
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
