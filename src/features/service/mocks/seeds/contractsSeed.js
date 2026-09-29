import { buildCustomers } from './casesSeed'
import { buildCatalogItems } from './catalogSeed'
import { createRandom, hoursAgo } from './seedUtils'

/**
 * Contract types, contracts (versions, parties, items, signatures,
 * amendments) and handoffs per template (spec §27, §32).
 */
const L = (ar, en) => ({ ar, en })
const DAY = 24

const TYPES = {
  devices: [['sales', L('عقد بيع', 'Sales contract'), true], ['maintenance', L('عقد صيانة', 'Maintenance contract'), true]],
  tourism: [['booking', L('عقد حجز', 'Booking agreement'), false]],
  school: [['enrollment', L('عقد التحاق', 'Enrollment agreement'), true]],
  shipping: [['merchant', L('اتفاقية تاجر', 'Merchant agreement'), true]],
}

export const CONTRACT_STATUSES = ['draft', 'sent', 'partially_signed', 'signed', 'active', 'expiring', 'expired', 'terminated', 'cancelled', 'renewed']

export function buildContractTypes(manifest) {
  return (TYPES[manifest.template] || TYPES.devices).map(([key, label, requiresSignature]) => ({
    id: `ctt-${key}`,
    key,
    label,
    requires_signature: requiresSignature,
    renewal_type: key === 'sales' ? 'none' : 'manual',
    checklist: [
      { key: 'contact_verified', label: L('تم التأكد من بيانات التواصل', 'Contact details verified') },
      { key: 'welcome_sent', label: L('تم إرسال رسالة الترحيب', 'Welcome message sent') },
      { key: 'portal_invited', label: L('تمت دعوة العميل للبوابة', 'Customer invited to the portal') },
    ],
    active: true,
  }))
}

export function buildContractsState(manifest) {
  const random = createRandom(`contracts-${manifest.template}`)
  const customers = buildCustomers(manifest)
  const items = buildCatalogItems(manifest)
  const types = buildContractTypes(manifest)
  const sellable = items.filter((item) => item.price > 0)
  const contracts = []
  const handoffs = []

  const statuses = ['draft', 'sent', 'partially_signed', 'signed', 'active', 'active', 'active', 'expiring', 'terminated', 'active']
  statuses.forEach((status, index) => {
    const id = `ctr-${index + 1}`
    const customer = customers[(index * 3) % customers.length]
    const type = types[index % types.length]
    const lines = Array.from({ length: random.int(1, 2) }).map((_, n) => {
      const item = sellable[(index + n) % sellable.length]
      const quantity = item.kind === 'product' ? random.int(1, 3) : 1
      const discount = random.chance(0.4) ? Math.round(item.price * quantity * 0.05) : 0
      const signedLike = ['signed', 'active', 'expiring', 'terminated'].includes(status)
      return {
        id: `${id}-l${n + 1}`,
        item_id: item.id,
        name: item.name,
        kind: item.kind,
        quantity,
        unit_price: item.price,
        discount,
        total: item.price * quantity - discount,
        fulfillment_status: signedLike ? (index === 6 && n === 0 ? 'needs_review' : 'fulfilled') : 'pending',
      }
    })
    const total = lines.reduce((sum, line) => sum + line.total, 0)
    const startDays = random.int(10, 300)
    const signed = ['signed', 'active', 'expiring', 'terminated'].includes(status)
    const versions = [{ version: 1, status: signed ? 'signed' : status === 'draft' ? 'draft' : 'sent', summary: L('النسخة الأولى', 'First version'), created_at: hoursAgo(DAY * (startDays + 5)) }]
    if (index === 1) versions.push({ version: 2, status: 'sent', summary: L('تعديل الخصم بعد التفاوض', 'Discount changed after negotiation'), created_at: hoursAgo(DAY * startDays) })

    contracts.push({
      id,
      contract_number: `CT-2026-${String(300 + index)}`,
      type_id: type.id,
      customer_id: customer.id,
      customer: { id: customer.id, name: customer.name, phone: customer.phone },
      deal_id: index % 2 ? `deal-${100 + index}` : null,
      start_date: hoursAgo(DAY * startDays),
      end_date: hoursAgo(DAY * (startDays - (status === 'expiring' ? startDays + 20 : 365))),
      status,
      currency: 'EGP',
      total_value: total,
      renewal_type: type.renewal_type,
      signed_at: signed ? hoursAgo(DAY * startDays) : null,
      activated_at: ['active', 'expiring', 'terminated'].includes(status) ? hoursAgo(DAY * (startDays - 1)) : null,
      effective_version: versions.length,
      parent_contract_id: null,
      parties: [
        { party_type: 'customer', name: customer.name, role: 'buyer' },
        { party_type: 'company', name: 'ICAN', role: 'seller' },
      ],
      items: lines,
      versions,
      signatures: signed || status === 'partially_signed'
        ? [
            { version: versions.length, signer_type: 'customer', signer_name: customer.name, method: random.pick(['otp', 'wet_ink', 'e_sign']), signed_at: hoursAgo(DAY * startDays) },
            ...(signed ? [{ version: versions.length, signer_type: 'company', signer_name: 'أحمد علي', method: 'e_sign', signed_at: hoursAgo(DAY * startDays) }] : []),
          ]
        : [],
      amendments: index === 4 ? [{ id: `${id}-a1`, number: 1, summary: L('إضافة جهاز ثاني للعقد', 'Add a second unit'), changes: { add_items: [{ item_id: lines[0].item_id, quantity: 1 }] }, status: 'draft', effective_date: hoursAgo(-DAY * 3), signed_at: null }] : [],
      terminated_reason: status === 'terminated' ? L('طلب العميل إنهاء التعاقد', 'Customer asked to terminate') : null,
      sales_owner: { id: 'agent-3', name: 'منى حسن' },
      version: 1,
    })

    if (signed) {
      const needsReview = index === 6
      handoffs.push({
        id: `ho-${index + 1}`,
        contract_id: id,
        contract_version: versions.length,
        customer_id: customer.id,
        status: needsReview ? 'needs_review' : index === 3 ? 'pending' : index === 8 ? 'active' : 'accepted',
        sales_owner: { id: 'agent-3', name: 'منى حسن' },
        cs_owner: needsReview || index === 3 ? null : { id: 'agent-1', name: 'سارة محمود' },
        notes: index === 3 ? 'العميل مستعجل على التركيب قبل الصيف.' : null,
        promises: index === 3 ? [{ id: 'pr-1', text: 'خصم 10% على تجديد عقد الصيانة', due_at: hoursAgo(-DAY * 300), done: false }] : [],
        checklist: type.checklist.map((entry, n) => ({ key: entry.key, label: entry.label, done: !needsReview && n === 0 })),
        created_entities: lines
          .filter((_, n) => !(needsReview && n === 0))
          .map((line, n) => {
            const creates = items.find((item) => item.id === line.item_id)?.service_config.fulfillment?.creates || 'none'
            return { line_id: line.id, type: creates, id: `${creates}-${index}-${n}`, label: line.name }
          })
          .filter((entry) => entry.type !== 'none'),
        errors: needsReview ? [{ line_id: lines[0].id, code: 'MISSING_FULFILLMENT_CONFIG', item: lines[0].name }] : [],
        amendments_applied: [],
        created_at: hoursAgo(DAY * startDays),
        version: 1,
      })
    }
  })

  return { contracts, handoffs }
}
