import { useTranslation } from 'react-i18next'
import { useMetaWizard, useWizardField } from '../../context/MetaWizardContext'
import { useCustomAudiences, useLanguages } from '../../hooks/useWizardAssets'
import { Callout, DemoDataBadge, IssueMessage, SegmentedControl, Switch, ToggleChip } from '../fields'
import { inputClassName } from '../fields/FieldFrame'
import { DetailedTargetingPicker } from './DetailedTargetingPicker'

const AGES = Array.from({ length: 53 }, (_, index) => index + 13)

/** Age, gender, languages, detailed targeting and saved audiences for one ad set. */
export function AudienceFields({ adSet, restricted, onChange }) {
  const { t, i18n } = useTranslation()
  const { tenantId, accountId } = useMetaWizard()
  const audience = adSet.audience
  const update = (patch) => onChange({ ...audience, ...patch })
  const ageField = useWizardField(`adSets.${adSet.id}.audience.age`, 'audience.age')
  const languages = useLanguages({ tenantId, accountId })
  const audiences = useCustomAudiences({ tenantId, accountId })
  const toggle = (list, value) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  const ageLabel = (age) => (age === 65 ? '65+' : String(age))

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-[var(--border)] p-3">
        <Switch
          checked={audience.advantageAudience && !restricted}
          disabled={restricted}
          onChange={(advantageAudience) => update({ advantageAudience })}
          label={t('campaignWizard.audience.advantageTitle')}
          description={restricted ? t('campaignWizard.audience.advantageRestricted') : t(audience.advantageAudience ? 'campaignWizard.audience.advantageOn' : 'campaignWizard.audience.advantageOff')}
        />
      </div>

      {restricted && <Callout tone="warning" title={t('campaignWizard.audience.restrictedTitle')}>{t('campaignWizard.audience.restrictedBody')}</Callout>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5" data-wizard-field={`adSets.${adSet.id}.audience.age`}>
          <span className="text-sm font-medium text-[var(--text)]">{t(audience.advantageAudience && !restricted ? 'campaignWizard.audience.ageSuggestion' : 'campaignWizard.audience.age')}</span>
          <div className="flex items-center gap-2" dir="ltr">
            <select disabled={restricted} value={audience.ageMin} onChange={(event) => update({ ageMin: Number(event.target.value) })} onFocus={ageField.fieldProps.onFocus} onBlur={ageField.fieldProps.onBlur} aria-label={t('campaignWizard.audience.ageMin')} className={inputClassName(ageField.hasError)}>
              {AGES.map((age) => <option key={age} value={age}>{ageLabel(age)}</option>)}
            </select>
            <span className="text-[var(--text-muted)]">–</span>
            <select disabled={restricted} value={audience.ageMax} onChange={(event) => update({ ageMax: Number(event.target.value) })} onFocus={ageField.fieldProps.onFocus} onBlur={ageField.fieldProps.onBlur} aria-label={t('campaignWizard.audience.ageMax')} className={inputClassName(ageField.hasError)}>
              {AGES.map((age) => <option key={age} value={age}>{ageLabel(age)}</option>)}
            </select>
          </div>
          {ageField.issue && <IssueMessage issue={ageField.issue} />}
        </div>
        <div className="grid content-start gap-1.5">
          <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.audience.gender')}</span>
          <SegmentedControl
            value={restricted ? 'all' : audience.genders}
            onChange={(genders) => update({ genders })}
            ariaLabel={t('campaignWizard.audience.gender')}
            options={['all', 'male', 'female'].map((value) => ({ value, label: t(`campaignWizard.audience.genders.${value}`), disabled: restricted && value !== 'all' }))}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.audience.languages')}<span className="ms-1.5 text-xs font-normal text-[var(--text-light)]">{t('campaignWizard.common.optional')}</span></span>
          <DemoDataBadge show={languages.data?.isMock} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(languages.data?.items || []).map((language) => (
            <ToggleChip key={language.id} selected={audience.languages.includes(language.id)} onToggle={() => update({ languages: toggle(audience.languages, language.id) })}>
              {i18n.language === 'ar' ? language.name.ar : language.name.en}
            </ToggleChip>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)]">{t('campaignWizard.audience.languagesHint')}</p>
      </div>

      <DetailedTargetingPicker label={t(audience.advantageAudience && !restricted ? 'campaignWizard.audience.interestsSuggestion' : 'campaignWizard.audience.interests')} value={audience.detailedTargeting} onChange={(detailedTargeting) => update({ detailedTargeting })} />
      <DetailedTargetingPicker label={t('campaignWizard.audience.exclusions')} value={audience.detailedExclusions || []} onChange={(detailedExclusions) => update({ detailedExclusions })} disabled={restricted} disabledReason={t('campaignWizard.audience.exclusionsRestricted')} />

      <div className="grid gap-1.5" data-wizard-field={`adSets.${adSet.id}.audience.customAudienceIds`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.audience.customAudiences')}<span className="ms-1.5 text-xs font-normal text-[var(--text-light)]">{t('campaignWizard.common.optional')}</span></span>
          <DemoDataBadge show={audiences.data?.isMock} />
        </div>
        {audiences.isLoading && <p className="text-xs text-[var(--text-muted)]">{t('campaignWizard.common.loading')}</p>}
        {audiences.isError && <p className="text-xs text-[var(--notification-danger)]">{t('campaignWizard.common.loadError')}</p>}
        <ul className="grid gap-1.5">
          {(audiences.data?.items || []).map((item) => {
            const isLookalike = item.subtype === 'LOOKALIKE'
            const includedState = audience.customAudienceIds.includes(item.id) ? 'include' : (audience.excludedCustomAudienceIds || []).includes(item.id) ? 'exclude' : 'none'
            return (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm text-[var(--text)]">{item.name}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{t(`campaignWizard.audience.audienceTypes.${item.subtype}`, { defaultValue: item.subtype })}{item.approximateCount ? ` · ${new Intl.NumberFormat(i18n.language).format(item.approximateCount)}` : ''}</span>
                </span>
                <SegmentedControl
                  size="sm"
                  value={includedState}
                  ariaLabel={item.name}
                  onChange={(next) => update({
                    customAudienceIds: next === 'include' ? [...new Set([...audience.customAudienceIds, item.id])] : audience.customAudienceIds.filter((id) => id !== item.id),
                    excludedCustomAudienceIds: next === 'exclude' ? [...new Set([...(audience.excludedCustomAudienceIds || []), item.id])] : (audience.excludedCustomAudienceIds || []).filter((id) => id !== item.id),
                  })}
                  options={[
                    { value: 'none', label: t('campaignWizard.audience.audienceNone') },
                    { value: 'include', label: t('campaignWizard.geo.include'), disabled: restricted && isLookalike },
                    { value: 'exclude', label: t('campaignWizard.geo.exclude') },
                  ]}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
