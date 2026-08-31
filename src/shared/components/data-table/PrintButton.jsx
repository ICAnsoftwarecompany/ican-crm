import { Printer } from 'lucide-react'
import { Button } from '../ui/Button'

export function PrintButton({ onClick, disabled = false }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="gap-2"
      title="Print table"
    >
      <Printer size={16} />
      
    </Button>
  )
}
