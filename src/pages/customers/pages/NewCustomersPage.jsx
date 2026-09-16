import { UserPlus } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'

export function NewCustomersPage() {
  return (
    <CustomerPlaceholderPage
      title="العملاء المحتملون الجدد"
      description="عرض العملاء المحتملين الذين تمت إضافتهم مؤخرا وتجهيز إجراءات المتابعة الأولى."
      icon={UserPlus}
    />
  )
}
