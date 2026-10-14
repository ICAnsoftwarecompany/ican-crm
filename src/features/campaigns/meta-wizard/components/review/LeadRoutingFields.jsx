import { useTranslation } from 'react-i18next'
import { useTeams } from '../../../../teams/hooks/useTeams'
import { useStatuses, useTags } from '../../../../definitions/hooks/useDefinitions'
import { useMetaWizard } from '../../context/MetaWizardContext'
import { SelectField, TextAreaField, ToggleChip } from '../fields'

const labelOf = (item) => item?.name || item?.title || item?.label || item?.status_name || item?.tag_name || String(item?.id ?? '')

/**
 * What the CRM does with leads from this campaign: which team receives
 * them, which tags and first status they get. Sent as `crm_lead_routing`
 * for the backend's assignment engine.
 */
export function LeadRoutingFields() {
  const { t } = useTranslation()
  const { state, actions } = useMetaWizard()
  const routing = state.leadRouting
  const teams = useTeams()
  const tags = useTags()
  const statuses = useStatuses()
  const toggleTag = (id) => actions.updateLeadRouting({ tagIds: routing.tagIds.includes(id) ? routing.tagIds.filter((item) => item !== id) : [...routing.tagIds, id] })

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField path="leadRouting.teamId" guideKey="leadRouting.team" label={t('campaignWizard.routing.team')} value={routing.teamId}
          placeholder={teams.isLoading ? t('campaignWizard.common.loading') : t('campaignWizard.routing.useDefaultRules')}
          onChange={(teamId) => actions.updateLeadRouting({ teamId })}
          options={(teams.data || []).map((team) => ({ value: String(team.id), label: labelOf(team) }))}
          hint={teams.isError ? t('campaignWizard.common.loadError') : t('campaignWizard.routing.teamHint')} />
        <SelectField path="leadRouting.statusId" guideKey="leadRouting.status" label={t('campaignWizard.routing.status')} value={routing.statusId}
          placeholder={statuses.isLoading ? t('campaignWizard.common.loading') : t('campaignWizard.routing.defaultStatus')}
          onChange={(statusId) => actions.updateLeadRouting({ statusId })}
          options={(statuses.data || []).map((status) => ({ value: String(status.id), label: labelOf(status) }))} />
      </div>
      <div className="grid gap-1.5">
        <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.routing.tags')}<span className="ms-1.5 text-xs font-normal text-[var(--text-light)]">{t('campaignWizard.common.optional')}</span></span>
        {tags.isLoading && <p className="text-xs text-[var(--text-muted)]">{t('campaignWizard.common.loading')}</p>}
        {tags.isError && <p className="text-xs text-[var(--notification-danger)]">{t('campaignWizard.common.loadError')}</p>}
        {tags.data && !tags.data.length && <p className="text-xs text-[var(--text-muted)]">{t('campaignWizard.routing.noTags')}</p>}
        <div className="flex flex-wrap gap-1.5">
          {(tags.data || []).map((tag) => (
            <ToggleChip key={tag.id} selected={routing.tagIds.includes(String(tag.id))} onToggle={() => toggleTag(String(tag.id))}>{labelOf(tag)}</ToggleChip>
          ))}
        </div>
      </div>
      <TextAreaField path="leadRouting.note" guideKey="leadRouting.note" label={t('campaignWizard.routing.note')} optional rows={2} value={routing.note} onChange={(note) => actions.updateLeadRouting({ note })} placeholder={t('campaignWizard.routing.notePlaceholder')} />
    </div>
  )
}
