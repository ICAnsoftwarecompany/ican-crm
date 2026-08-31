import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'

export function parseAdditionalData(value) {
  if (!value) return []

  let parsed = value
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value)
    } catch {
      return []
    }
  }

  const source = Array.isArray(parsed) ? parsed[0] : parsed
  if (!source || typeof source !== 'object') return []

  return Object.entries(source).map(([name, fieldValue]) => ({
    id: `${name}-${Math.random().toString(16).slice(2)}`,
    name,
    value: typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue ?? ''),
  }))
}

export function getAdditionalFieldNames(value) {
  return parseAdditionalData(value)
    .map((row) => row.name)
    .filter(Boolean)
}

export function serializeAdditionalData(rows = []) {
  const dataObject = rows.reduce((result, row) => {
    const key = row.name?.trim()
    if (!key) return result
    result[key] = row.value ?? ''
    return result
  }, {})

  if (!Object.keys(dataObject).length) return null
  return JSON.stringify([dataObject])
}

export function createEmptyAdditionalRow(name = '') {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    value: '',
  }
}

export function AdditionalDataFields({ rows, onChange, suggestions = [] }) {
  const updateRow = (id, key, value) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)))
  }

  const addRow = (name = '') => {
    if (name && rows.some((row) => row.name === name)) return
    onChange([...rows, createEmptyAdditionalRow(name)])
  }

  const removeRow = (id) => {
    onChange(rows.filter((row) => row.id !== id))
  }

  const availableSuggestions = suggestions.filter((name) => !rows.some((row) => row.name === name))

  return (
    <div className="space-y-4">
      {availableSuggestions.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="mb-2 text-xs font-semibold text-[var(--text-muted)]">
            خانات موجودة في الفئة
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => addRow(name)}
                className="rounded-full border border-[#00C2CB]/40 px-3 py-1 text-xs font-semibold text-[#007C83] transition-colors hover:bg-[#00C2CB]/10"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
            <Input
              label="اسم الخانة"
              value={row.name}
              onChange={(event) => updateRow(row.id, 'name', event.target.value)}
              placeholder="مثال: color"
              dir="ltr"
            />
            <Input
              label="القيمة"
              value={row.value}
              onChange={(event) => updateRow(row.id, 'value', event.target.value)}
              placeholder="القيمة"
            />
            <Button type="button" variant="outline" onClick={() => removeRow(row.id)}>
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={() => addRow()}>
        <Plus size={16} />
        إضافة خانة
      </Button>
    </div>
  )
}
