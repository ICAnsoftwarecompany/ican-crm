export function customerDealTimeline(deals = [], customerId) {
  return deals.map((entry) => ({
    id: `customer-deal-${entry.id ?? entry.deal_id}`,
    type: entry.status === 'won' ? 'deal_won' : entry.status === 'lost' ? 'deal_lost' : 'deal',
    category: 'deal',
    title: entry.deal?.name || '',
    date: (entry.status === 'won' ? entry.won_at : entry.status === 'lost' ? entry.lost_at : null) || entry.added_at || entry.created_at || null,
    user: entry.owner,
    userName: entry.owner?.name || '',
    customerId,
    customerDeal: entry,
    activityScope: 'deal',
    contextDeal: { deal_id: entry.deal_id ?? entry.deal?.id, deal_name: entry.deal?.name },
  }))
}
