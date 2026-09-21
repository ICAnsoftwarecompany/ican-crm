import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { useOutreachCampaigns } from '../../features/outreach-campaigns/hooks/useOutreachCampaigns'
import { campaignsToCalendarEvents } from '../../features/outreach-campaigns/utils/campaignCalendar'
import { OutreachCalendarContent } from '../../features/outreach-campaigns/components/OutreachCalendarContent'

export function OutreachCalendarPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const query = useOutreachCampaigns()
  const events = useMemo(() => campaignsToCalendarEvents(query.campaigns), [query.campaigns])

  return (
    <div>
      <PageToolbar title={t('outreachCampaigns.navigation.calendar')} />
      <OutreachCalendarContent events={events} query={query} onOpenCampaign={(id) => navigate(`/outreach-campaigns/${id}`)} />
    </div>
  )
}
