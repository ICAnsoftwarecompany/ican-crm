function safeText(value) {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

export function renderSafeValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function getLead(row) {
  return row?.lead || {}
}

function parseJsonData(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'object') return [value]

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return []
  }
}

export function parseMarketingData(value) {
  return parseJsonData(value)
}

function getProductFromLink(link) {
  return link?.products || link?.product || null
}

function normalizeLinkedProduct(link, sourceKind) {
  const product = getProductFromLink(link)

  return {
    id: link?.id || product?.id || `${sourceKind}-${product?.name || link?.product_id || Math.random()}`,
    sourceKind,
    productId: link?.product_id || product?.id || '',
    name: product?.name || link?.name || '',
    code: product?.code || '',
    description: product?.desc || link?.desc || '',
    image: product?.image || '',
    price: product?.price || '',
    raw: product || link || {},
    linkRaw: link || {},
    note: link?.note || link?.notes || '',
    status: link?.status ?? product?.status ?? '',
    isMain: Number(link?.is_main || 0) === 1,
    interestLevel: link?.interest_level || '',
    data: link?.data || product?.data || null,
    dataItems: parseJsonData(product?.data || link?.data),
  }
}

function collectLinkedProductsFromSource(source, sourceKind) {
  const links = Array.isArray(source?.linked_products) ? source.linked_products : []
  return links.map((link) => normalizeLinkedProduct(link, sourceKind))
}

function collectManualInterestedProducts(row) {
  const lead = getLead(row)
  const interesteds = [
    ...(Array.isArray(row?.interesteds) ? row.interesteds : []),
    ...(Array.isArray(lead?.interesteds) ? lead.interesteds : []),
  ]

  const seen = new Set()
  return interesteds
    .map((item) => normalizeLinkedProduct(item, 'manual'))
    .filter((item) => {
      const key = `${item.productId || ''}-${item.name || ''}-${item.note || ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function getCustomerMarketingSource(row) {
  const lead = getLead(row)

  if (lead?.form) {
    return {
      kind: 'form',
      label: 'Form',
      title: lead.form.name || 'Facebook Lead Form',
      description: lead.form.description || '',
      code: lead.form.code || '',
      externalId: lead.form.external_id || '',
      platform: lead.form.platform || '',
      status: lead.form.status || '',
      startDate: '',
      endDate: '',
      budget: '',
      targetAudience: '',
      fields: lead.form.fields || null,
      linkedProducts: collectLinkedProductsFromSource(lead.form, 'form'),
      raw: lead.form,
    }
  }

  if (lead?.ad) {
    return {
      kind: 'ad',
      label: 'Ad',
      title: lead.ad.name || 'Ad',
      description: lead.ad.description || '',
      code: lead.ad.code || '',
      externalId: lead.ad.external_id || '',
      platform: lead.ad.platform || '',
      status: lead.ad.status || '',
      startDate: lead.ad.start_date || '',
      endDate: lead.ad.end_date || '',
      budget: lead.ad.budget || '',
      targetAudience: lead.ad.target_audience || '',
      image: lead.ad.image || '',
      linkedProducts: collectLinkedProductsFromSource(lead.ad, 'ad'),
      raw: lead.ad,
    }
  }

  if (lead?.campaign) {
    return {
      kind: 'campaign',
      label: 'Campaign',
      title: lead.campaign.name || 'Campaign',
      description: lead.campaign.description || '',
      code: lead.campaign.code || '',
      externalId: lead.campaign.external_id || '',
      platform: lead.campaign.platform || '',
      status: lead.campaign.status || '',
      startDate: lead.campaign.start_date || '',
      endDate: lead.campaign.end_date || '',
      budget: lead.campaign.budget || '',
      targetAudience: lead.campaign.target_audience || '',
      linkedProducts: collectLinkedProductsFromSource(lead.campaign, 'campaign'),
      raw: lead.campaign,
    }
  }

  const manualProducts = collectManualInterestedProducts(row)

  return {
    kind: 'manual',
    label: 'Manual',
    title: lead?.source || row?.source || row?.linked_type || 'Manual',
    description: '',
    code: '',
    externalId: '',
    platform: lead?.source || row?.source || '',
    status: '',
    startDate: '',
    endDate: '',
    budget: '',
    targetAudience: '',
    linkedProducts: manualProducts,
    raw: {
      source: lead?.source || row?.source || '',
      linked_type: lead?.linked_type || row?.linked_type || '',
      interesteds: [
        ...(Array.isArray(row?.interesteds) ? row.interesteds : []),
        ...(Array.isArray(lead?.interesteds) ? lead.interesteds : []),
      ],
    },
  }
}

export function getCustomerLinkedProducts(row) {
  const source = getCustomerMarketingSource(row)
  const sourceProducts = Array.isArray(source.linkedProducts) ? source.linkedProducts : []
  const manualProducts = source.kind === 'manual' ? [] : collectManualInterestedProducts(row)
  return [...sourceProducts, ...manualProducts]
}

export function getCustomerPerson(row, key) {
  const lead = getLead(row)
  const person = row?.[key] || lead?.[key] || null
  if (!person || typeof person !== 'object') return null

  return {
    id: person.id || '',
    name: person.name || person.username || person.email || '',
    role: person.role || '',
    type: person.type || '',
    active: person.active,
    teamId: person.team_id || '',
    teamName: person.team?.name || person.team_name || '',
    email: person.email || '',
  }
}

export function getCustomerLeadActivities(row) {
  const lead = getLead(row)
  const activities = [
    ...(Array.isArray(row?.lead_activities) ? row.lead_activities : []),
    ...(Array.isArray(lead?.lead_activities) ? lead.lead_activities : []),
  ]

  const seen = new Set()
  return activities
    .filter((activity) => activity && typeof activity === 'object')
    .filter((activity) => {
      const key = String(activity.id || `${activity.type || ''}-${activity.created_at || activity.activity_at || ''}-${activity.title || ''}`)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((first, second) => {
      const firstTime = new Date(first.activity_at || first.created_at || 0).getTime()
      const secondTime = new Date(second.activity_at || second.created_at || 0).getTime()
      return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime)
    })
}

export function buildCustomerMarketingSearchText(row) {
  const lead = getLead(row)
  const source = getCustomerMarketingSource(row)
  const products = getCustomerLinkedProducts(row)
  const linkedBy = getCustomerPerson(row, 'linked_by')
  const agent = getCustomerPerson(row, 'agent')
  const leadActivities = getCustomerLeadActivities(row)

  return [
    row?.company,
    lead?.company,
    row?.code,
    lead?.code,
    row?.linked_type,
    lead?.linked_type,
    row?.lead_type,
    lead?.lead_type,
    source.label,
    source.title,
    source.description,
    source.code,
    source.externalId,
    source.platform,
    source.status,
    source.budget,
    source.targetAudience,
    linkedBy?.name,
    linkedBy?.role,
    linkedBy?.type,
    linkedBy?.teamId,
    agent?.name,
    agent?.role,
    agent?.type,
    agent?.teamId,
    ...leadActivities.flatMap((activity) => [
      activity.type,
      activity.title,
      activity.description,
      activity.activity_at,
      activity.created_at,
    ]),
    ...products.flatMap((product) => [
      product.name,
      product.code,
      product.description,
      product.note,
      product.interestLevel,
      product.price,
    ]),
  ].map(safeText).filter(Boolean).join(' ')
}

export function enrichCustomerMarketingRow(row) {
  const lead = getLead(row)
  const source = getCustomerMarketingSource(row)
  const products = getCustomerLinkedProducts(row)
  const linkedBy = getCustomerPerson(row, 'linked_by')
  const agent = getCustomerPerson(row, 'agent')
  const leadActivities = getCustomerLeadActivities(row)
  const attributes = Array.isArray(row?.attributes) ? row.attributes : []
  const attributeValues = attributes.reduce((result, attribute) => {
    const key = safeText(attribute?.key).trim()
    if (!key) return result
    result[key] = renderSafeValue(attribute?.value)
    return result
  }, {})

  return {
    ...row,
    __marketingSourceKind: source.kind,
    __marketingSourceText: buildCustomerMarketingSearchText(row),
    __linkedProductsText: products.map((product) => product.name).filter(Boolean).join(' '),
    __leadActivitiesText: leadActivities
      .flatMap((activity) => [activity.type, activity.title, activity.description, activity.activity_at, activity.created_at])
      .map(safeText)
      .filter(Boolean)
      .join(' '),
    __attributeValues: attributeValues,
    __customerCompany: row?.company || lead?.company || '',
    __customerCode: row?.code || lead?.code || '',
    __linkedType: row?.linked_type || lead?.linked_type || '',
    __leadType: row?.lead_type || lead?.lead_type || '',
    __linkedByText: [linkedBy?.name, linkedBy?.role, linkedBy?.type, linkedBy?.teamId].filter(Boolean).join(' '),
    __agentText: [agent?.name, agent?.role, agent?.type, agent?.teamId].filter(Boolean).join(' '),
  }
}
