import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { ToggleMode } from '../components/ToggleMode'
import { CampaignBudgetFields } from '../components/CampaignBudgetFields'

const SPECIAL_AD_CATEGORIES = ['NONE', 'CREDIT', 'EMPLOYMENT', 'HOUSING']

export function CampaignSetupStep({ t, campaign, pages, onChangeCampaign, onFocusField, onBlurField }) {
  const specialAdCategory = campaign.specialAdCategories[0] || 'NONE'

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label={t('campaigns.create.name')}
            value={campaign.name}
            onChange={(event) => onChangeCampaign({ name: event.target.value })}
            onFocus={() => onFocusField('campaignSetup.name')}
            onBlur={onBlurField}
          />
        </div>

        <Select
          label={t('campaigns.create.page')}
          placeholder={t('campaigns.create.selectPage')}
          value={campaign.pageId}
          onChange={(next) => onChangeCampaign({ pageId: next })}
          onFocus={() => onFocusField('campaignSetup.pageId')}
          onBlur={onBlurField}
          options={pages.map((page) => ({
            value: String(page.page_id || page.id),
            label: page.name || page.page_name || page.page_id || page.id,
          }))}
        />

        <Select
          label={t('campaigns.create.campaignSetup.specialAdCategory.label')}
          value={specialAdCategory}
          onChange={(next) => onChangeCampaign({ specialAdCategories: next === 'NONE' ? [] : [next] })}
          onFocus={() => onFocusField('campaignSetup.specialAdCategories')}
          onBlur={onBlurField}
          options={SPECIAL_AD_CATEGORIES.map((category) => ({
            value: category,
            label: t(`campaigns.create.campaignSetup.specialAdCategory.options.${category}`),
          }))}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-[var(--text)]">
          {t('campaigns.create.campaignSetup.budgetLevel.label')}
        </h3>
        <ToggleMode
          name="budgetLevel"
          value={campaign.budgetLevel}
          onChange={(next) => onChangeCampaign({ budgetLevel: next })}
          options={[
            {
              value: 'campaign',
              title: t('campaigns.create.campaignSetup.budgetLevel.campaign.title'),
              description: t('campaigns.create.campaignSetup.budgetLevel.campaign.description'),
              onFocusGuide: () => onFocusField('campaignSetup.budgetLevel'),
              onBlurGuide: onBlurField,
            },
            {
              value: 'adSet',
              title: t('campaigns.create.campaignSetup.budgetLevel.adSet.title'),
              description: t('campaigns.create.campaignSetup.budgetLevel.adSet.description'),
              onFocusGuide: () => onFocusField('campaignSetup.budgetLevel'),
              onBlurGuide: onBlurField,
            },
          ]}
        />
      </div>

      {campaign.budgetLevel === 'campaign' ? (
        <CampaignBudgetFields
          value={campaign}
          onChange={onChangeCampaign}
          onFocusField={onFocusField}
          onBlurField={onBlurField}
          scope="campaignSetup"
        />
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          {t('campaigns.create.campaignSetup.budgetLevel.adSetNote')}
        </p>
      )}
    </div>
  )
}
