import { AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'

export function ErrorState({ error, onRetry }) {
  const message = error?.message || 'حدث خطأ في تحميل البيانات'

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle size={48} className="text-red-500 mb-3" />
      <h3 className="font-arabic font-medium text-[var(--text)] mb-1">خطأ في التحميل</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry} size="sm">
          حاول مرة أخرى
        </Button>
      )}
    </div>
  )
}
