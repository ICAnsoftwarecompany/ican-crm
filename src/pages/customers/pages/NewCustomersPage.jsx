import { UserPlus } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'

export function NewCustomersPage() {
  return (
    <CustomerPlaceholderPage
      title="العملاء الجدد"
      description="عرض العملاء الذين تمت إضافتهم مؤخرًا وتجهيز إجراءات المتابعة الأولى."
      icon={UserPlus}
    />
  )
}
