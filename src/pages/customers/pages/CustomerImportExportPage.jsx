import { ArrowLeftRight } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'

export function CustomerImportExportPage() {
  return (
    <CustomerPlaceholderPage
      title="الاستيراد والتصدير"
      description="إدارة عمليات استيراد العملاء وتصدير البيانات مع الحفاظ على إعدادات الجدول."
      icon={ArrowLeftRight}
    />
  )
}
