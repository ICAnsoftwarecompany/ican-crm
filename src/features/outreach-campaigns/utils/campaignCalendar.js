export function campaignToCalendarEvent(campaign) {
  if (!campaign?.id || !campaign.startsAt) return null
  const value = String(campaign.startsAt).trim()
  const start = new Date(/^\d{4}-\d\d-\d\d \d\d:\d\d/.test(value) ? value.replace(' ', 'T') : value)
  if (Number.isNaN(start.getTime())) return null

  return {
    id: `outreach-${campaign.id}`,
    sourceId: 'outreach-campaigns',
    title: campaign.name || `#${campaign.id}`,
    start,
    end: start,
    allDay: false,
    status: campaign.status,
    rawId: campaign.id,
    raw: campaign,
  }
}

export function campaignsToCalendarEvents(campaigns = []) {
  return campaigns.map(campaignToCalendarEvent).filter(Boolean)
}
