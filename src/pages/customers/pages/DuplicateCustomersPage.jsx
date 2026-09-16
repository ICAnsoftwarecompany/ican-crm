import { Copy } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'

export function DuplicateCustomersPage() {
  return (
    <CustomerPlaceholderPage
      title="السجلات المكررة"
      description="اكتشاف السجلات المتشابهة ومراجعة الدمج داخل مركز العملاء المحتملين."
      icon={Copy}
    />
  )
}
