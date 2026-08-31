import { Copy } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'

export function DuplicateCustomersPage() {
  return (
    <CustomerPlaceholderPage
      title="العملاء المكررون"
      description="اكتشاف السجلات المتشابهة ومراجعة دمج العملاء المكررين."
      icon={Copy}
    />
  )
}
