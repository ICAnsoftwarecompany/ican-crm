import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { formatMoney } from '../../utils/campaignMoney'
import { useMetaWizard } from '../../context/MetaWizardContext'
import { locationDisplayName } from '../../domain/geoTargeting'
import { getEffectiveAdName, getEffectiveAdSetName, getEffectiveCampaignName } from '../../domain/naming'
import { getEffectiveSchedule } from '../../domain/buildMetaPayloads'
import { StatusDot } from '../fields'
import { adSetStatus, adStatus } from '../../steps/stepStatus'

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-1.5 text-sm">
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className="min-w-0 break-words text-[var(--text)]">{children || '—'}</dd>
    </div>
  )
}

/** Campaign → ad sets → ads, each with an edit shortcut back to its stage. */
export function ReviewSummary({ onEdit }) {
  const { t, i18n } = useTranslation()
  const { state, pages, account, issues } = useMetaWizard()
  const campaign = state.campaign
  const page = pages.find((item) => String(item.page_id || item.id) === String(campaign.pageId))
  const money = (value) => (value ? formatMoney(value, account.currency, i18n.language) : '')
  const schedule = (value) => [
    value.startType === 'scheduled' ? t('campaignWizard.review.startsAt', { time: value.startTime.replace('T', ' ') }) : t('campaignWizard.schedule.startNow'),
    value.endType === 'scheduled' && value.endTime ? t('campaignWizard.review.endsAt', { time: value.endTime.replace('T', ' ') }) : t('campaignWizard.schedule.endNever'),
  ].join(' · ')
  const budget = (owner) => (owner.budgetAmount ? `${money(owner.budgetAmount)} ${t(`campaignWizard.budget.${owner.budgetType}`)} · ${t(`campaignWizard.budget.strategies.${owner.bidStrategy}.title`, { defaultValue: '' })}` : '')

  return (
    <div className="grid gap-3">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <header className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[var(--text)]">{t('campaignWizard.review.campaign')}</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit('campaignSetup')}><Pencil size={13} />{t('campaignWizard.common.edit')}</Button>
        </header>
        <dl className="divide-y divide-[var(--border)]">
          <Row label={t('campaignWizard.campaignSetup.name')}>{getEffectiveCampaignName(state, t)}</Row>
          <Row label={t('campaignWizard.review.objective')}>{state.objective ? t(`campaignWizard.objectives.${state.objective}.title`) : ''}</Row>
          <Row label={t('campaignWizard.campaignSetup.page')}>{page?.name || page?.page_name}</Row>
          <Row label={t('campaignWizard.campaignSetup.specialTitle')}>{campaign.specialAdCategories.map((category) => t(`campaignWizard.specialCategories.${category}.title`)).join(t('campaignWizard.common.listSeparator')) || t('campaignWizard.campaignSetup.specialNoneShort')}</Row>
          <Row label={t('campaignWizard.review.budget')}>{campaign.budgetLevel === 'campaign' ? budget(campaign) : t('campaignWizard.review.adSetBudgets')}</Row>
          <Row label={t('campaignWizard.review.schedule')}>{schedule(campaign.schedule)}</Row>
        </dl>
      </section>

      {state.adSets.map((adSet) => {
        const locations = adSet.audience.geo.locations
        const included = locations.filter((item) => item.mode !== 'exclude').map((item) => locationDisplayName(item, i18n.language))
        const excluded = locations.filter((item) => item.mode === 'exclude').map((item) => locationDisplayName(item, i18n.language))
        return (
          <section key={adSet.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <header className="mb-2 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text)]"><StatusDot status={adSetStatus(issues, adSet.id)} />{getEffectiveAdSetName(adSet, t, i18n.language)}</h3>
              <Button variant="ghost" size="sm" onClick={() => onEdit('adSets', { adSetId: adSet.id })}><Pencil size={13} />{t('campaignWizard.common.edit')}</Button>
            </header>
            <dl className="divide-y divide-[var(--border)]">
              <Row label={t('campaignWizard.adSets.conversionLocation')}>{adSet.conversionLocation ? `${t(`campaignWizard.locations.${adSet.conversionLocation}.title`)} · ${adSet.performanceGoal ? t(`campaignWizard.goals.${adSet.performanceGoal}.title`) : ''}` : ''}</Row>
              <Row label={t('campaignWizard.review.locations')}>
                {included.join(t('campaignWizard.common.listSeparator'))}
                {excluded.length > 0 && <span className="block text-xs text-[var(--notification-danger)]">{t('campaignWizard.review.excluding', { list: excluded.join(t('campaignWizard.common.listSeparator')) })}</span>}
              </Row>
              <Row label={t('campaignWizard.review.audience')}>
                {`${adSet.audience.ageMin}–${adSet.audience.ageMax === 65 ? '65+' : adSet.audience.ageMax} · ${t(`campaignWizard.audience.genders.${adSet.audience.genders}`)}`}
                {adSet.audience.advantageAudience && <span className="block text-xs text-[var(--text-muted)]">{t('campaignWizard.review.advantageOn')}</span>}
                {adSet.audience.detailedTargeting.length > 0 && <span className="block text-xs text-[var(--text-muted)]">{adSet.audience.detailedTargeting.map((item) => (i18n.language === 'ar' ? item.name?.ar : item.name?.en) || item.name).join(t('campaignWizard.common.listSeparator'))}</span>}
              </Row>
              <Row label={t('campaignWizard.adSets.placementsTitle')}>{t(`campaignWizard.placements.${adSet.placements.mode}.title`)}</Row>
              {state.campaign.budgetLevel === 'adSet' && <Row label={t('campaignWizard.review.budget')}>{budget(adSet)}</Row>}
              <Row label={t('campaignWizard.review.schedule')}>{schedule(getEffectiveSchedule(state, adSet))}</Row>
              <Row label={t('campaignWizard.review.ads')}>
                <ul className="grid gap-1">
                  {adSet.ads.map((ad) => (
                    <li key={ad.id}>
                      <button type="button" onClick={() => onEdit('ads', { adSetId: adSet.id, adId: ad.id })} className="flex items-center gap-2 text-start hover:underline">
                        <StatusDot status={adStatus(issues, ad.id)} />
                        {getEffectiveAdName(ad, t)}
                        <span className="text-xs text-[var(--text-muted)]">· {t(`campaignWizard.ads.formats.${ad.format}.title`)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Row>
            </dl>
          </section>
        )
      })}
    </div>
  )
}
