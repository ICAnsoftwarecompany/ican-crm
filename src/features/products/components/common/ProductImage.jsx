import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package } from 'lucide-react'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { resolveApiBaseURL } from '../../../../services/apiBaseUrl'

function tenantBaseUrl() {
  try {
    return resolveApiBaseURL()
  } catch {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }
}

/** Absolute URL of a product image path returned by the API. */
export function buildCatalogImageUrl(path) {
  const value = String(path || '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || /^(data|blob):/i.test(value)) return value
  return `${tenantBaseUrl().replace(/\/+$/, '')}/${encodeURI(value.replace(/^\/+/, ''))}`
}

/** Thumbnail that opens the full image in a modal. Sizes: `sm` (table), `lg`, `xl` (details page / drawer, 2026-10-15). */
export function ProductImage({ src, name, size = 'sm' }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const url = buildCatalogImageUrl(src)
  const box = { sm: 'h-9 w-9', lg: 'h-24 w-24', xl: 'h-48 w-full sm:w-48' }[size] || 'h-9 w-9'

  if (!url || failed) {
    return (
      <span className={`inline-flex ${box} shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]`}>
        <Package size={size === 'sm' ? 16 : size === 'xl' ? 56 : 32} aria-hidden="true" />
      </span>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
        className={`inline-flex ${box} shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:ring-2 hover:ring-[#00C2CB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]`}
        aria-label={t('catalog.common.viewImage')}
      >
        <img src={url} alt={name || ''} className="h-full w-full object-cover" loading="lazy" onError={() => setFailed(true)} />
      </button>
      <AppModal isOpen={open} onClose={() => setOpen(false)} title={name || t('catalog.common.image')} size="lg" className="max-w-4xl">
        <div className="flex justify-center">
          <img src={url} alt={name || ''} className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain" />
        </div>
      </AppModal>
    </>
  )
}
