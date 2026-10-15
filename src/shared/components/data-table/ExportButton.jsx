import { Download } from 'lucide-react'
import { Button } from '../ui/Button'

export function ExportButton({ onClick, disabled = false }) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className="gap-2"
      title="Export to Excel"
    >
      <Download size={16} />
       <span className="sr-only">Excel</span>
    </Button>
  )
}
