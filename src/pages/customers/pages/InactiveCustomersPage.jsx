import { UserRoundX } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'

export function InactiveCustomersPage() {
  return (
    <CustomerPlaceholderPage
      title="غير النشطين"
      description="متابعة العملاء المحتملين الذين لم يحدث معهم نشاط أو تواصل لفترة طويلة."
      icon={UserRoundX}
    />
  )
}
