import { UserCheck } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'

export function CustomerAssignmentsPage() {
  return (
    <CustomerPlaceholderPage
      title="توزيع العملاء"
      description="إدارة إسناد العملاء إلى أعضاء الفريق ومراجعة قواعد التوزيع."
      icon={UserCheck}
    />
  )
}
