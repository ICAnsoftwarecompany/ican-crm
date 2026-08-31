import { Settings } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'

export function CustomersSettingsPage() {
  return (
    <CustomerPlaceholderPage
      title="إعدادات العملاء"
      description="تهيئة طريقة عرض العملاء وقواعد المتابعة والتصنيف الخاصة بالقسم."
      icon={Settings}
    />
  )
}
