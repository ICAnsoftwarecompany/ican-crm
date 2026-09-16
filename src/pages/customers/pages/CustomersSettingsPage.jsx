import { Settings } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'

export function CustomersSettingsPage() {
  return (
    <CustomerPlaceholderPage
      title="إعدادات مركز العملاء المحتملين"
      description="تهيئة طريقة العرض وقواعد المتابعة والتصنيف الخاصة بمركز العملاء المحتملين."
      icon={Settings}
    />
  )
}
