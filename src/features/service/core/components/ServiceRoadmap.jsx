import { useTranslation } from 'react-i18next'
import { Flag, Map as MapIcon } from 'lucide-react'
import { Badge } from '../../../../shared/components/ui/Badge'
import { CURRENT_SERVICE_PHASE, SERVICE_PHASES, getModulesForPhase } from '../constants/serviceModules'
import { isModuleMocked } from '../api/serviceHttp'

const STATUS_VARIANT = { done: 'success', in_progress: 'warning', planned: 'default' }

/**
 * Live view of docs/4-CUSTOMER-SERVICE.md phases, read from the module
 * registry so the screen and the registry never drift apart.
 */
export function ServiceRoadmap() {
  const { t } = useTranslation()

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
        <MapIcon size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
        {t('service.roadmap.title')}
      </h2>

      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {SERVICE_PHASES.map((phase) => {
          const isCurrent = phase.id === CURRENT_SERVICE_PHASE
          return (
            <li
              key={phase.id}
              className={`rounded-lg border p-3 ${
                isCurrent ? 'border-brand-accent bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface-2)]'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--text)]">
                  <span dir="ltr">F{phase.id}</span> · {t(`service.phases.${phase.key}.name`)}
                </p>
                {phase.milestone && (
                  <Badge variant="info">
                    <Flag size={12} className="me-1" aria-hidden="true" />
                    {t(`service.roadmap.milestones.${phase.milestone}`)}
                  </Badge>
                )}
              </div>
              <p className="mb-3 text-xs text-[var(--text-muted)]">{t(`service.phases.${phase.key}.description`)}</p>
              <ul className="flex flex-wrap gap-1.5">
                {getModulesForPhase(phase.id).map((module) => (
                  <li key={module.key}>
                    <Badge variant={STATUS_VARIANT[module.status]}>
                      {t(`service.modules.${module.key}`)}
                      <span className="ms-1 opacity-70">
                        · {t(isModuleMocked(module.key) ? 'service.roadmap.source.mock' : 'service.roadmap.source.live')}
                      </span>
                    </Badge>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
