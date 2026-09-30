import { useTranslation } from 'react-i18next'
import { useMetaWizard, useWizardField } from '../../context/MetaWizardContext'
import { useLeadForms } from '../../hooks/useWizardAssets'
import { WIZARD_PUBLISH_CAPABILITIES } from '../../config/wizardCapabilities'
import { formatDate } from '../../../../../shared/utils/dateTime'
import { Callout, ChoiceCard, DemoDataBadge, IssueMessage, SegmentedControl } from '../fields'
import { LeadFormBuilder } from './LeadFormBuilder'

/** Instant form: pick an existing Page form or build a new one. */
export function LeadFormSection({ ad, pageId, path, onChange }) {
  const { t, i18n } = useTranslation()
  const { tenantId, accountId } = useMetaWizard()
  const leadForm = ad.leadForm
  const forms = useLeadForms({ tenantId, accountId, pageId, enabled: Boolean(pageId) && leadForm.mode === 'existing' })
  const { issue } = useWizardField(path, 'leadForm.select')
  const update = (patch) => onChange({ leadForm: { ...leadForm, ...patch } })

  return (
    <div className="grid gap-3" data-wizard-field={path}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl value={leadForm.mode} onChange={(mode) => update({ mode })} ariaLabel={t('campaignWizard.leadForm.title')}
          options={[{ value: 'existing', label: t('campaignWizard.leadForm.useExisting') }, { value: 'new', label: t('campaignWizard.leadForm.createNew') }]} />
        {leadForm.mode === 'existing' && <DemoDataBadge show={forms.data?.isMock} />}
      </div>

      {leadForm.mode === 'existing' && (
        <>
          {!pageId && <Callout tone="warning">{t('campaignWizard.leadForm.choosePageFirst')}</Callout>}
          {forms.isLoading && <p className="text-sm text-[var(--text-muted)]">{t('campaignWizard.common.loading')}</p>}
          {forms.isError && <p className="text-sm text-[var(--notification-danger)]">{t('campaignWizard.common.loadError')}</p>}
          {forms.data && !forms.data.items.length && <p className="text-sm text-[var(--text-muted)]">{t('campaignWizard.leadForm.noForms')}</p>}
          <div role="radiogroup" className="grid gap-2 md:grid-cols-2">
            {(forms.data?.items || []).map((form) => (
              <ChoiceCard
                key={form.id}
                compact
                disabled={form.status !== 'ACTIVE'}
                title={form.name}
                description={[
                  t(`campaignWizard.leadForm.types.${form.formType}.title`),
                  t('campaignWizard.leadForm.questionsCount', { count: form.questions.length }),
                  form.leadsCount !== undefined ? t('campaignWizard.leadForm.leadsCount', { count: form.leadsCount }) : null,
                  form.createdTime ? formatDate(form.createdTime, i18n.language) : null,
                ].filter(Boolean).join(' · ')}
                badge={form.status !== 'ACTIVE' ? <span className="text-[10px] font-semibold text-[var(--text-light)]">{t('campaignWizard.leadForm.archived')}</span> : null}
                selected={leadForm.formId === form.id}
                onSelect={() => update({ formId: form.id })}
              />
            ))}
          </div>
        </>
      )}

      {leadForm.mode === 'new' && (
        <>
          {!WIZARD_PUBLISH_CAPABILITIES.createLeadForms && <Callout tone="info">{t('campaignWizard.leadForm.createPending')}</Callout>}
          <LeadFormBuilder draft={leadForm.draft} path={path} onChange={(draft) => update({ draft })} />
        </>
      )}
      {issue && <IssueMessage issue={issue} />}
    </div>
  )
}
