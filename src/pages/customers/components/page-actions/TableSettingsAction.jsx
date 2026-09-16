import { SlidersHorizontal } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'

export function TableSettingsAction({ onClick }) {
  if (!onClick) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
      title="إعدادات جدول العملاء المحتملين"
      aria-label="إعدادات جدول العملاء المحتملين"
    >
      <SlidersHorizontal size={15} />
      <span className="hidden sm:inline">إعدادات الجدول</span>
    </Button>
  )
}
