import { useCallback } from 'react'
import { Button } from '../../ui/Button'

export const BooleanFilterInput = ({ column, value, onChange }) => {
  const currentValue = value?.value

  const handleTrue = useCallback(() => {
    onChange({ type: 'boolean', value: true })
  }, [onChange])

  const handleFalse = useCallback(() => {
    onChange({ type: 'boolean', value: false })
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  return (
    <div className="flex gap-1">
      <Button
        variant={currentValue === true ? 'primary' : 'outline'}
        size="sm"
        onClick={handleTrue}
        className="flex-1 h-8 text-xs"
        title={`Filter: Yes for ${column.header}`}
      >
        نعم
      </Button>
      <Button
        variant={currentValue === false ? 'primary' : 'outline'}
        size="sm"
        onClick={handleFalse}
        className="flex-1 h-8 text-xs"
        title={`Filter: No for ${column.header}`}
      >
        لا
      </Button>
      {currentValue !== undefined && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="h-8 text-xs font-bold text-red-600 hover:bg-red-50"
          title="Clear filter"
        >
          مسح
        </Button>
      )}
    </div>
  )
}
