import { CampaignAudienceBuilder } from '../CampaignAudienceBuilder'

export function CampaignAudienceStep({ form, onChange }) {
  return (
    <CampaignAudienceBuilder
      selectedCustomers={form.audience.customers}
      onChange={(customers) => onChange({ audience: { customers } })}
    />
  )
}
