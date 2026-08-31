import { Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'

export function CopyButton({ onClick, disabled = false, title = 'Copy to Clipboard' }) {
  const [isCopied, setIsCopied] = useState(false)

  const handleClick = async () => {
    await onClick()
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className="gap-2"
      title={title}
    >
      {isCopied ? <Check size={16} /> : <Copy size={16} />}
      {isCopied ? 'تم النسخ' : 'نسخ'}
    </Button>
  )
}
