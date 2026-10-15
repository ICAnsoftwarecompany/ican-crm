import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardPaste, FileSpreadsheet, Search, UserPlus } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'
import { useUsers } from '../../../../users'
import { usePipelineTemplates } from '../../../hooks/useDeals'
import { getOpenStages, resolveDealStages } from '../../../utils/dealStages'
import { MAX_NEW_LEADS, validateLeadRows } from '../../../utils/leadSource'
import { FieldLabel, dealInputClass } from '../../common/FieldLabel'
import { PersonSelect } from '../../common/PersonSelect'
import { ExistingLeadSearch } from './ExistingLeadSearch'
import { LeadBasketList } from './LeadBasketList'
import { NewLeadsInput } from './NewLeadsInput'

const WAYS = [
  { id: 'crm', icon: Search },
  { id: 'type', icon: UserPlus },
  { id: 'paste', icon: ClipboardPaste },
  { id: 'file', icon: FileSpreadsheet },
]

/**
 * "Free" deal: one basket of leads — picked from the CRM (`existing`) and / or new ones (`rows`) typed, pasted from
 * Excel or read from a file — plus who owns them and the stage they start in.
 */
export function LeadsBasket({ value, pipeline, onChange, error }) {
  const { t } = useTranslation()
  const [way, setWay] = useState('crm')
  const usersQuery = useUsers()
  const { templates } = usePipelineTemplates()
  const people = useMemo(() => (usersQuery.data || []).map((user) => ({ id: String(user.id), name: user.name || user.email || `#${user.id}` })), [usersQuery.data])
  const stages = useMemo(() => {
    if (pipeline.mode !== 'existing') return []
    return getOpenStages(resolveDealStages({ pipeline_template_id: pipeline.templateId }, templates))
  }, [pipeline.mode, pipeline.templateId, templates])
  const rowErrors = useMemo(() => validateLeadRows(value.rows, value.existing), [value.rows, value.existing])
  const addRows = (rows) => onChange({ rows: [...value.rows, ...rows] })

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldLabel label={t('dealWorkspace.wizard.source.leads.owner')} hint={t('dealWorkspace.wizard.source.leads.ownerHint')}>
          <PersonSelect people={people} value={value.ownerId} onChange={(ownerId) => onChange({ ownerId })} placeholder={t('dealWorkspace.wizard.source.leads.noOwner')} />
        </FieldLabel>
        <FieldLabel label={t('dealWorkspace.wizard.source.leads.stage')} hint={t(pipeline.mode === 'existing' ? 'dealWorkspace.wizard.source.leads.stageHint' : 'dealWorkspace.wizard.source.leads.stageNewPipeline')}>
          <select className={dealInputClass} value={value.stageId} onChange={(event) => onChange({ stageId: event.target.value })} disabled={!stages.length}>
            <option value="">{t('dealWorkspace.wizard.source.leads.firstStage')}</option>
            {stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
          </select>
        </FieldLabel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <header>
            <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.wizard.source.leads.addTitle')}</h3>
            <p className="text-xs leading-5 text-[var(--text-muted)]">{t('dealWorkspace.wizard.source.leads.addDescription')}</p>
          </header>
          <div role="tablist" aria-label={t('dealWorkspace.wizard.source.leads.addTitle')} className="grid grid-cols-2 gap-1 rounded-lg bg-[var(--surface-2)] p-1 sm:grid-cols-4">
            {WAYS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={way === id}
                onClick={() => setWay(id)}
                className={cn('inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold', way === id ? 'bg-[var(--surface)] text-[var(--brand-accent)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]')}
              >
                <Icon size={14} />{t(`dealWorkspace.wizard.source.leads.ways.${id}`)}
              </button>
            ))}
          </div>
          {way === 'crm'
            ? <ExistingLeadSearch existing={value.existing} onChange={(existing) => onChange({ existing })} />
            : <NewLeadsInput way={way} onAdd={addRows} room={MAX_NEW_LEADS - value.rows.length} />}
        </section>

        <LeadBasketList
          existing={value.existing}
          rows={value.rows}
          rowErrors={rowErrors}
          onExisting={(existing) => onChange({ existing })}
          onRows={(rows) => onChange({ rows })}
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
