import { buildCases, buildCustomers } from './casesSeed'
import { buildCatalogItems } from './catalogSeed'
import { createRandom, hoursAgo } from './seedUtils'

/**
 * Assets, warranties, entitlements and the entitlement ledger (spec §34–35).
 * Devices template gets assets (air conditioners with serials + warranty);
 * subscription templates (school bus, merchant plan) get entitlements only.
 */
const L = (ar, en) => ({ ar, en })
const DAY = 24

export function buildAssetsState(manifest) {
  const random = createRandom(`assets-${manifest.template}`)
  const customers = buildCustomers(manifest)
  const items = buildCatalogItems(manifest)
  const cases = buildCases(manifest)
  const assetItems = items.filter((item) => item.service_config.fulfillment?.creates === 'asset')
  const planItems = items.filter((item) => item.service_config.fulfillment?.creates === 'subscription')

  const assets = []
  const warranties = []
  const entitlements = []
  const transactions = []

  if (assetItems.length) {
    Array.from({ length: 12 }).forEach((_, index) => {
      const item = random.pick(assetItems)
      const customer = customers[index % customers.length]
      const purchasedDaysAgo = random.int(20, 900)
      const installedDaysAgo = purchasedDaysAgo - random.int(1, 7)
      const id = `asset-${index + 1}`
      const status = index === 3 ? 'in_repair' : index === 9 ? 'retired' : 'active'
      const linked = cases
        .filter((entry) => entry.customer.id === customer.id && ['ct-maintenance', 'ct-warranty_claim', 'ct-installation'].includes(entry.type_id))
        .slice(0, 3)
        .map((entry) => entry.id)
      assets.push({
        id,
        customer_id: customer.id,
        customer: { id: customer.id, name: customer.name, phone: customer.phone },
        item_id: item.id,
        item_name: item.name,
        asset_type: 'air_conditioner',
        name: item.name,
        serial_number: `SN-${random.int(100000, 999999)}${String.fromCharCode(65 + (index % 26))}`,
        model_number: item.id === 'p-ac-3' ? 'CARR-36K' : 'CARR-18K',
        purchase_date: hoursAgo(DAY * purchasedDaysAgo),
        installation_date: hoursAgo(DAY * installedDaysAgo),
        status,
        location: { address: `${random.pick(['مدينة نصر', 'المعادي', 'الشيخ زايد', 'سموحة'])} — ${random.int(1, 40)}` },
        linked_case_ids: linked,
        transfers: [],
        version: 1,
      })

      // Manufacturer warranty from the item capability (24 months from installation).
      const warrantyId = `war-${index + 1}`
      const ends = installedDaysAgo - 730
      warranties.push({
        id: warrantyId,
        asset_id: id,
        type: 'standard',
        source_type: 'item',
        source_id: item.id,
        starts_at: hoursAgo(DAY * installedDaysAgo),
        ends_at: hoursAgo(DAY * ends),
        coverage: { parts: true, labor: true, exclusions: L('سوء الاستخدام وتقلبات الكهرباء', 'Misuse and power surges') },
        status: status === 'retired' ? 'void' : ends < 0 ? 'active' : 'expired',
      })
      entitlements.push({
        id: `ent-w-${index + 1}`,
        customer_id: customer.id,
        asset_id: id,
        warranty_id: warrantyId,
        type: 'warranty_service',
        quota: null,
        period: 'per_term',
        starts_at: hoursAgo(DAY * installedDaysAgo),
        ends_at: hoursAgo(DAY * ends),
        case_type_ids: ['ct-maintenance', 'ct-warranty_claim'],
        sla_policy_id: null,
        source_type: 'warranty',
        source_id: warrantyId,
        status: status === 'retired' ? 'suspended' : ends < 0 ? 'active' : 'expired',
        version: 1,
      })

      // Some customers bought the annual maintenance plan → 4 visits per year.
      if (index % 3 === 0) {
        const entitlementId = `ent-v-${index + 1}`
        entitlements.push({
          id: entitlementId,
          customer_id: customer.id,
          asset_id: id,
          warranty_id: null,
          type: 'visits',
          quota: 4,
          period: 'per_year',
          starts_at: hoursAgo(DAY * 200),
          ends_at: hoursAgo(-DAY * 165),
          case_type_ids: ['ct-maintenance'],
          sla_policy_id: 'sla-high',
          source_type: 'contract',
          source_id: `ctr-${index + 1}`,
          status: 'active',
          version: 1,
        })
        const used = index === 0 ? 4 : random.int(0, 3)
        Array.from({ length: used }).forEach((__, n) =>
          transactions.push({
            id: `tx-${entitlementId}-${n + 1}`,
            entitlement_id: entitlementId,
            type: 'consume',
            quantity: 1,
            source_type: 'work_order',
            source_id: `wo-${index + 1}-${n + 1}`,
            reason: L('زيارة صيانة دورية', 'Routine maintenance visit'),
            created_by: { id: 'agent-2', name: 'أحمد علي' },
            created_at: hoursAgo(DAY * (180 - n * 40)),
          })
        )
      }
    })
  }

  // Subscription-style entitlements (priority support, support hours) for plan templates.
  if (!assetItems.length && planItems.length) {
    customers.slice(0, 6).forEach((customer, index) => {
      const id = `ent-s-${index + 1}`
      entitlements.push({
        id,
        customer_id: customer.id,
        asset_id: null,
        warranty_id: null,
        type: index % 2 ? 'support' : 'priority_support',
        quota: index % 2 ? 10 : null,
        period: 'per_month',
        starts_at: hoursAgo(DAY * 20),
        ends_at: hoursAgo(-DAY * (10 + index * 30)),
        case_type_ids: [],
        sla_policy_id: index % 2 ? null : 'sla-urgent',
        source_type: 'subscription',
        source_id: `sub-${index + 1}`,
        status: index === 5 ? 'expired' : 'active',
        version: 1,
      })
      if (index % 2) {
        Array.from({ length: random.int(1, 6) }).forEach((__, n) =>
          transactions.push({
            id: `tx-${id}-${n + 1}`,
            entitlement_id: id,
            type: 'consume',
            quantity: 1,
            source_type: 'case',
            source_id: `case-${random.int(1, 28)}`,
            reason: L('طلب دعم', 'Support request'),
            created_by: { id: 'agent-1', name: 'سارة محمود' },
            created_at: hoursAgo(DAY * random.int(1, 18)),
          })
        )
      }
    })
  }

  return { assets, warranties, entitlements, transactions }
}
