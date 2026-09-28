import { useTranslation } from 'react-i18next'
import { Blocks, Languages, Layers } from 'lucide-react'
import { Badge } from '../../../../shared/components/ui/Badge'
import { SERVICE_FEATURE_KEYS, SERVICE_MODEL_CODES, SERVICE_TERM_ENTITIES } from '../constants/serviceCatalog'
import { useServiceTerminology } from '../capabilities/useServiceCapabilities'

function Panel({ icon: Icon, title, children }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
        <Icon size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  )
}

/**
 * Shows what the current tenant's manifest enables: business models,
 * features and terminology. Doubles as the F0 verification screen for
 * i18n (AR/EN) and theme (light/dark).
 */
export function CapabilitiesOverview({ manifest }) {
  const { t } = useTranslation()
  const term = useServiceTerminology()

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel icon={Layers} title={t('service.overview.models')}>
        <ul className="grid gap-2">
          {SERVICE_MODEL_CODES.map((code) => {
            const enabled = manifest.models.includes(code)
            return (
              <li key={code} className="flex items-start gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                    enabled ? 'bg-brand-accent text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                  }`}
                  dir="ltr"
                >
                  {code}
                </span>
                <div className={enabled ? '' : 'opacity-60'}>
                  <p className="text-sm font-medium text-[var(--text)]">{t(`service.models.${code}.name`)}</p>
                  <p className="text-xs text-[var(--text-muted)]">{t(`service.models.${code}.description`)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </Panel>

      <Panel icon={Blocks} title={t('service.overview.features')}>
        <div className="flex flex-wrap gap-2">
          {SERVICE_FEATURE_KEYS.map((key) => (
            <Badge key={key} variant={manifest.features.includes(key) ? 'success' : 'default'}>
              {t(`service.features.${key}`)}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">{t('service.overview.featuresHint')}</p>
      </Panel>

      <Panel icon={Languages} title={t('service.overview.terminology')}>
        <dl className="grid gap-2">
          {SERVICE_TERM_ENTITIES.map((entity) => (
            <div key={entity} className="flex items-center justify-between gap-3 rounded-md bg-[var(--surface-2)] px-3 py-2">
              <dt className="text-xs text-[var(--text-muted)]">{t(`service.overview.entities.${entity}`)}</dt>
              <dd className="text-sm font-medium text-[var(--text)]">
                {term(entity)} · {term(entity, 'other')}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  )
}
