import { useTranslation } from 'react-i18next'
import { CalendarDays, CheckSquare, Phone, Plus } from 'lucide-react'
import { DropdownMenu } from '../../../shared/components/overlays/DropdownMenu'
import { Button } from '../../../shared/components/ui/Button'

export function CreateEventMenu({ onCreateTask, onCreateMeeting, onCreateCall }) {
  const { t } = useTranslation()

  return (
    <DropdownMenu
      trigger={
        <Button variant="accent" size="sm">
          <Plus size={16} />
          {t('calendar.create')}
        </Button>
      }
      items={[
        { id: 'task', label: t('calendar.createTask'), icon: <CheckSquare size={15} />, onSelect: onCreateTask },
        { id: 'meeting', label: t('calendar.createMeeting'), icon: <CalendarDays size={15} />, onSelect: onCreateMeeting },
        { id: 'call', label: t('calendar.createCall'), icon: <Phone size={15} />, onSelect: onCreateCall },
      ]}
    />
  )
}
