import { useState, useCallback, useEffect } from 'react'
import { Input } from '../../ui/Input'

export const TextFilterInput = ({ column, value, onChange }) => {
  const [inputValue, setInputValue] = useState(value?.value || '')
  const [operator, setOperator] = useState(value?.operator || 'contains')

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value)
  }, [])

  const handleInputBlur = useCallback(() => {
    if (inputValue.trim()) {
      onChange({ type: 'text', operator, value: inputValue.trim() })
    } else {
      onChange(null)
    }
  }, [inputValue, operator, onChange])

  const handleOperatorChange = useCallback((e) => {
    const newOperator = e.target.value
    setOperator(newOperator)
    if (inputValue.trim()) {
      onChange({ type: 'text', operator: newOperator, value: inputValue.trim() })
    }
  }, [inputValue, onChange])

  return (
    <div className="flex flex-col gap-1">
      <select
        value={operator}
        onChange={handleOperatorChange}
        className="h-8 px-2 rounded border border-gray-300 text-xs bg-white"
        title={`Filter operator for ${column.header}`}
      >
        <option value="contains">يحتوي</option>
        <option value="starts_with">يبدأ بـ</option>
        <option value="ends_with">ينتهي بـ</option>
        <option value="equals">يساوي</option>
      </select>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={`${column.header}...`}
        className="h-8 px-2 text-xs"
        title={`Enter value to filter by ${column.header}`}
      />
    </div>
  )
}
