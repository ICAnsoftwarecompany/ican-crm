import { Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { useTranslation } from 'react-i18next'

export function CopyButton({ onClick, disabled = false, title }) {
  const { t } = useTranslation()
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
      title={title || t('dataTable.copy')}
    >
      {isCopied ? <Check size={16} /> : <Copy size={16} />}
      {isCopied ? t('dataTable.copied') : t('dataTable.copy')}
    </Button>
  )
}
