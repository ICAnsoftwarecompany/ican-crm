import { BellRing } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'

export function FollowUpCustomersPage() {
  return (
    <CustomerPlaceholderPage
      title="يحتاجون متابعة"
      description="قائمة العملاء المحتملين الذين يحتاجون إلى تواصل أو إجراء تال من فريق المبيعات."
      icon={BellRing}
    />
  )
}
