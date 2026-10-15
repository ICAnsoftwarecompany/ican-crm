import { useTranslation } from 'react-i18next'
import { Clock, Megaphone, Users } from 'lucide-react'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { cn } from '../../../../shared/utils/cn'
import { CampaignPicker } from './source/CampaignPicker'
import { LeadsBasket } from './source/LeadsBasket'

const MODES = [
  { id: 'campaigns', icon: Megaphone },
  { id: 'leads', icon: Users },
  { id: 'later', icon: Clock },
]

/**
 * Step 5 — where the deal's leads come from (2026-10-16): linked to one or more campaigns, a "free" deal with leads
 * from the CRM and / or new leads (typed, pasted from Excel or read from a file), or later from the workspace.
 */
export function LeadSourceStep({ value, pipeline, ownerId, onChange, errors = {} }) {
  const { t } = useTranslation()
  const err = (key) => (errors[key] ? t(`dealWorkspace.wizard.errors.${errors[key]}`) : null)

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label={t('dealWorkspace.wizard.source.modeLabel')} className="grid gap-3 md:grid-cols-3">
        {MODES.map(({ id, icon: Icon }) => {
          const active = value.mode === id
          return (
            <label key={id} className={cn('flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors', active ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]')}>
              <input type="radio" name="deal-lead-source" className="sr-only" checked={active} onChange={() => onChange({ mode: id })} aria-label={t(`dealWorkspace.wizard.source.modes.${id}.title`)} />
              <span className={cn('inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', active ? 'bg-[var(--brand-accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]')}><Icon size={17} /></span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-[var(--text)]">{t(`dealWorkspace.wizard.source.modes.${id}.title`)}</span>
                <span className="block text-xs leading-5 text-[var(--text-muted)]">{t(`dealWorkspace.wizard.source.modes.${id}.text`)}</span>
              </span>
            </label>
          )
        })}
      </div>
      {err('mode') && <p className="text-xs text-red-600 dark:text-red-400">{err('mode')}</p>}

      {value.mode === 'campaigns' && <CampaignPicker value={value} onChange={onChange} error={err('campaigns')} />}
      {value.mode === 'leads' && <LeadsBasket value={value} pipeline={pipeline} ownerId={ownerId} onChange={onChange} error={err('leads')} />}
      {value.mode === 'later' && <ModuleNotice>{t('dealWorkspace.wizard.source.laterNote')}</ModuleNotice>}
    </div>
  )
}
