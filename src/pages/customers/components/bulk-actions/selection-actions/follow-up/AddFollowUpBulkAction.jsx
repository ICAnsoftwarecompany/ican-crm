import { Plus } from 'lucide-react'
import { Button } from '../../../../../../shared/components/ui/Button'

export function AddFollowUpBulkAction({ disabled = false, onClick }) {
  return (
    <Button
      variant="ai"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={
        disabled
          ? 'إضافة متابعة متاحة عند اختيار عميل محتمل واحد فقط'
          : 'إضافة متابعة على العميل المحتمل المحدد'
      }
      className="whitespace-nowrap"
    >
      <Plus size={14} />
      إضافة متابعة
    </Button>
  )
}
