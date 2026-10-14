import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Compass, Layers, PackagePlus, Ruler, X } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useItemTypes } from '../../hooks/useCatalogSetup'
import { usePersistentFlag } from '../hooks/usePersistentFlag'

/**
 * Setup guide (2026-10-14): shown on the products / services lists, the product wizard and the item types page
 * while the tenant has no active item type of that kind. Item types decide which fields, units and attached items a
 * product gets, so they come first. On the lists the guide can be dismissed (remembered in this browser).
 *
 * `kind`: 'product' | 'service' (null = any kind). `context`: 'list' | 'wizard' | 'itemTypes'.
 */
export function CatalogSetupGuide({ kind = null, context = 'list', returnTo }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const query = useItemTypes()
  const [dismissed, setDismissed] = usePersistentFlag(`guide-dismissed-${kind || 'all'}`, false)
  const entity = kind === 'service' ? 'service' : 'product'

  if (query.isLoading || query.isError) return null
  const hasType = (query.data || []).some((itemType) => itemType.status && (!kind || itemType.kind === kind))
  if (hasType || (context === 'list' && dismissed)) return null

  const params = new URLSearchParams()
  if (kind) params.set('kind', kind)
  if (returnTo) params.set('returnTo', returnTo)
  const createPath = `/products/item-types/new${params.toString() ? `?${params}` : ''}`
  const steps = [
    { id: 'types', icon: Layers },
    ...(kind === 'service' ? [] : [{ id: 'units', icon: Ruler }]),
    { id: 'items', icon: PackagePlus },
  ]

  return (
    <section className="relative rounded-lg border border-[var(--ai-border)] bg-[var(--ai-bg)] p-4" aria-labelledby={`catalog-guide-${context}`}>
      {context === 'list' && (
        <button
          type="button"
          className="absolute end-2 top-2 rounded p-1 text-[var(--text-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
          aria-label={t('catalogSetup.guide.dismiss')}
          onClick={() => setDismissed(true)}
        >
          <X size={16} />
        </button>
      )}
      <div className="flex items-start gap-3 pe-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--ai-text)]">
          <Compass size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`catalog-guide-${context}`} className="text-sm font-bold text-[var(--ai-text)]">{t(`catalogSetup.guide.title.${context === 'itemTypes' ? 'itemTypes' : entity}`)}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text)]">{t(`catalogSetup.guide.text.${context === 'itemTypes' ? 'itemTypes' : entity}`)}</p>

          <ol className="mt-3 grid gap-2 sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <li key={step.id} className="flex items-start gap-2 rounded-lg bg-[var(--surface)] p-2 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-bold text-[var(--text)]">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 font-semibold text-[var(--text)]"><Icon size={14} aria-hidden="true" />{t(`catalogSetup.guide.steps.${step.id}.title`)}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{t(`catalogSetup.guide.steps.${step.id}.text`)}</span>
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate(createPath)}>
              <Layers size={14} />
              {t(`catalogSetup.guide.addType.${kind || 'any'}`)}
            </Button>
            {context !== 'itemTypes' && (
              <Button size="sm" variant="outline" onClick={() => navigate('/products/item-types')}>{t('catalogSetup.guide.viewTypes')}</Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
