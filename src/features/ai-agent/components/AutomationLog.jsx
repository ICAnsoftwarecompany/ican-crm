import { Badge } from '../../../shared/components/ui/Badge'
import { displayValue } from '../../../shared/utils/apiResponse'

export function AutomationLog({ items = [] }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="mb-3 font-bold font-arabic text-[var(--text)]">سجل الأتمتة</h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">لا توجد إجراءات AI مسجلة بعد.</p>
      ) : (
        <div className="grid gap-2">
          {items.map((item, index) => (
            <div key={item.id || index} className="rounded-lg bg-[var(--surface-2)] p-3">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm">{displayValue(item.action)}</strong>
                <Badge variant={item.status === 'approved' ? 'success' : 'default'}>{displayValue(item.status)}</Badge>
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{displayValue(item.description || item.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
