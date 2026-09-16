import { Tag } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'

export function ChangeTagBulkAction({
  value,
  tags = [],
  disabled = false,
  loading = false,
  onChange,
  onSubmit,
  getTagLabel,
}) {
  return (
    <div className="flex min-w-0 gap-1">
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-9 min-w-0 flex-1 rounded-lg border border-[#D7EEF0] bg-white px-2 text-xs font-bold text-[var(--text)]"
      >
        <option value="">اختر تاج</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {getTagLabel?.(tag) || tag?.tag || tag?.name || tag?.status}
          </option>
        ))}
      </select>
      <Button
        size="icon"
        variant="ai"
        onClick={onSubmit}
        disabled={disabled}
        loading={loading}
        title="تغيير تاج العملاء المحتملين المحددين"
      >
        <Tag size={15} />
      </Button>
    </div>
  )
}
