import { UserRoundX } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'

export function InactiveCustomersPage() {
  return (
    <CustomerPlaceholderPage
      title="العملاء غير النشطين"
      description="متابعة العملاء الذين لم يحدث معهم نشاط أو تواصل لفترة طويلة."
      icon={UserRoundX}
    />
  )
}
