const matches = (item, id) => String(item?.product_id ?? item?.product?.id) === String(id)

export function interestedDealLeads(leads, productId, negotiations = []) {
  const negotiated = new Set(negotiations.filter((row) => row.items.some((item) => matches(item, productId))).map((row) => String(row.id)))
  return leads.filter((lead) => {
    const interests = [lead.interesteds, lead.interests, lead.lead?.interesteds, lead.lead?.interests, lead.customer?.interesteds].filter(Array.isArray).flat()
    return interests.some((item) => String(item?.product_id ?? item?.product?.id) === String(productId)) || negotiated.has(String(lead.id))
  })
}
