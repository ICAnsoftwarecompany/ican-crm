import {
  Building2, BookOpen, Car, Code2, Cog, Download, Dumbbell, GraduationCap, Hammer, MessagesSquare, Package, Pill,
  Plane, Puzzle, Repeat, School, ShieldCheck, Shirt, ShoppingBasket, SprayCan, Stethoscope, Store, Truck, Tv, Wrench,
} from 'lucide-react'

/**
 * Ready item types per domain (2026-10-14), from the master spec §25.7, §26 and §48. Picking one pre-fills the
 * item type wizard; the user still reviews every step. Names and descriptions: `catalogSetup.templates.<id>.*`.
 *
 * - `capabilities`: `{ code, config }` with registry codes (constants/capabilityRegistry.js).
 * - `units`: suggested alternative units by unit `code` (matched to the tenant's units of measure) and factor.
 * - `relationHints`: what is usually attached (shown as a hint in the attached items step).
 */
export const ITEM_TYPE_TEMPLATES = [
  // ── Products ────────────────────────────────────────────────────────────────
  {
    id: 'appliance', kind: 'product', icon: Tv, code: 'appliance', serviceModel: 'B', creates: 'asset',
    capabilities: [
      { code: 'serial_tracking', config: { required: true } },
      { code: 'warranty', config: { months: 24, starts_from: 'installation', extendable: true } },
      { code: 'installments', config: {} },
    ],
    relationHints: ['installation', 'maintenanceContract'],
  },
  {
    id: 'equipment', kind: 'product', icon: Cog, code: 'equipment', serviceModel: 'B', creates: 'asset',
    capabilities: [
      { code: 'serial_tracking', config: { required: true } },
      { code: 'warranty', config: { months: 12, starts_from: 'installation' } },
      { code: 'entitlements', config: {} },
      { code: 'installments', config: {} },
    ],
    relationHints: ['installation', 'maintenanceContract'],
  },
  {
    id: 'medicine', kind: 'product', icon: Pill, code: 'medicine', serviceModel: 'A', creates: 'none',
    capabilities: [
      { code: 'barcode', config: {} },
      { code: 'batch_lot', config: {} },
      { code: 'expiry', config: { alert_days: 60 } },
    ],
    units: [{ code: 'box', factor: 10 }],
  },
  {
    id: 'grocery', kind: 'product', icon: ShoppingBasket, code: 'grocery', serviceModel: 'A', creates: 'none',
    capabilities: [
      { code: 'barcode', config: {} },
      { code: 'batch_lot', config: {} },
      { code: 'expiry', config: { alert_days: 30 } },
    ],
    units: [{ code: 'carton', factor: 24 }],
  },
  {
    id: 'retail', kind: 'product', icon: Store, code: 'retail_item', serviceModel: 'A', creates: 'order',
    capabilities: [{ code: 'barcode', config: {} }],
    units: [{ code: 'pack', factor: 6 }],
  },
  {
    id: 'apparel', kind: 'product', icon: Shirt, code: 'apparel', serviceModel: 'A', creates: 'order',
    capabilities: [{ code: 'barcode', config: {} }],
  },
  {
    id: 'spareParts', kind: 'product', icon: Puzzle, code: 'spare_part', serviceModel: 'A', creates: 'none',
    capabilities: [{ code: 'barcode', config: {} }, { code: 'warranty', config: { months: 3, starts_from: 'sale' } }],
    units: [{ code: 'box', factor: 10 }],
  },
  {
    id: 'realEstate', kind: 'product', icon: Building2, code: 'real_estate_unit', serviceModel: 'B', creates: 'asset',
    capabilities: [
      { code: 'unique_unit', config: {} },
      { code: 'availability', config: { hold_days: 7 } },
      { code: 'warranty', config: { months: 12, starts_from: 'delivery' } },
      { code: 'installments', config: {} },
    ],
    relationHints: ['maintenanceContract'],
  },
  {
    id: 'vehicle', kind: 'product', icon: Car, code: 'vehicle', serviceModel: 'B', creates: 'asset',
    capabilities: [
      { code: 'unique_unit', config: {} },
      { code: 'warranty', config: { months: 36, starts_from: 'delivery' } },
      { code: 'installments', config: {} },
    ],
    relationHints: ['maintenanceContract'],
  },
  {
    id: 'digital', kind: 'product', icon: Download, code: 'digital_product', serviceModel: 'A', creates: 'none',
    capabilities: [{ code: 'digital_delivery', config: { delivery: 'license' } }],
  },

  // ── Services ────────────────────────────────────────────────────────────────
  {
    id: 'maintenanceVisit', kind: 'service', icon: Wrench, code: 'maintenance_visit', serviceModel: 'H', creates: 'work_order',
    capabilities: [
      { code: 'onsite', config: { expected_minutes: 60 } },
      { code: 'scheduling', config: { duration_minutes: 60 } },
      { code: 'warranty', config: { months: 3, starts_from: 'sale' } },
    ],
  },
  {
    id: 'installation', kind: 'service', icon: Hammer, code: 'installation', serviceModel: 'H', creates: 'work_order',
    capabilities: [{ code: 'onsite', config: { expected_minutes: 90 } }, { code: 'scheduling', config: { duration_minutes: 90 } }],
  },
  {
    id: 'cleaning', kind: 'service', icon: SprayCan, code: 'cleaning', serviceModel: 'H', creates: 'work_order',
    capabilities: [{ code: 'onsite', config: { expected_minutes: 120 } }, { code: 'scheduling', config: { duration_minutes: 120 } }],
  },
  {
    id: 'consultation', kind: 'service', icon: MessagesSquare, code: 'consultation', serviceModel: 'E', creates: 'booking',
    capabilities: [{ code: 'scheduling', config: { duration_minutes: 60 } }],
  },
  {
    id: 'clinic', kind: 'service', icon: Stethoscope, code: 'clinic_appointment', serviceModel: 'E', creates: 'booking',
    capabilities: [{ code: 'scheduling', config: { duration_minutes: 30 } }, { code: 'participants', config: { min: 1, max: 1 } }],
  },
  {
    id: 'tourPackage', kind: 'service', icon: Plane, code: 'tour_package', serviceModel: 'E', creates: 'booking',
    capabilities: [
      { code: 'scheduling', config: {} },
      { code: 'participants', config: { min: 1 } },
      { code: 'components', config: {} },
      { code: 'required_documents', config: {} },
      { code: 'capacity', config: {} },
      { code: 'installments', config: {} },
    ],
    relationHints: ['travelInsurance', 'airportTransfer'],
  },
  {
    id: 'shipment', kind: 'service', icon: Truck, code: 'shipment', serviceModel: 'F', creates: 'shipment',
    capabilities: [{ code: 'tracking', config: {} }, { code: 'participants', config: { min: 2, max: 2 } }],
  },
  {
    id: 'course', kind: 'service', icon: GraduationCap, code: 'course', serviceModel: 'D', creates: 'enrollment',
    capabilities: [
      { code: 'participants', config: { min: 1 } },
      { code: 'capacity', config: {} },
      { code: 'scheduling', config: {} },
      { code: 'installments', config: {} },
    ],
  },
  {
    id: 'schoolYear', kind: 'service', icon: School, code: 'school_year', serviceModel: 'D', creates: 'enrollment',
    capabilities: [
      { code: 'participants', config: { min: 1, max: 1 } },
      { code: 'entitlements', config: {} },
      { code: 'installments', config: {} },
    ],
    relationHints: ['schoolBus'],
  },
  {
    id: 'softwareProject', kind: 'service', icon: Code2, code: 'software_project', serviceModel: 'G', creates: 'project',
    capabilities: [
      { code: 'milestones', config: {} },
      { code: 'warranty', config: { months: 6, starts_from: 'delivery' } },
      { code: 'installments', config: {} },
    ],
    relationHints: ['supportPlan'],
  },

  // ── Plans & subscriptions ────────────────────────────────────────────────────
  {
    id: 'saasSubscription', kind: 'plan', icon: Repeat, code: 'saas_subscription', serviceModel: 'C', creates: 'subscription',
    capabilities: [
      { code: 'recurrence', config: { every: 1, unit: 'month', auto_renew: true, grace_days: 7 } },
      { code: 'entitlements', config: {} },
      { code: 'digital_delivery', config: { delivery: 'link' } },
    ],
    relationHints: ['onboarding'],
  },
  {
    id: 'maintenanceContract', kind: 'plan', icon: BookOpen, code: 'maintenance_contract', serviceModel: 'C', creates: 'subscription',
    capabilities: [
      { code: 'recurrence', config: { every: 1, unit: 'year', auto_renew: false, grace_days: 15 } },
      { code: 'entitlements', config: {} },
      { code: 'installments', config: {} },
    ],
  },
  {
    id: 'membership', kind: 'plan', icon: Dumbbell, code: 'membership', serviceModel: 'C', creates: 'subscription',
    capabilities: [{ code: 'recurrence', config: { every: 1, unit: 'month', auto_renew: true } }, { code: 'entitlements', config: {} }],
  },
  {
    id: 'extendedWarranty', kind: 'plan', icon: ShieldCheck, code: 'extended_warranty', serviceModel: 'C', creates: 'subscription',
    capabilities: [{ code: 'warranty', config: { months: 12, starts_from: 'sale' } }, { code: 'entitlements', config: {} }],
  },

  // ── Bundles ─────────────────────────────────────────────────────────────────
  {
    id: 'bundle', kind: 'bundle', icon: Package, code: 'bundle', serviceModel: 'A', creates: 'order',
    capabilities: [],
    relationHints: ['bundleItems'],
  },
]

export function templatesForKind(kind) {
  return ITEM_TYPE_TEMPLATES.filter((template) => template.kind === kind)
}

export function getTemplate(id) {
  return ITEM_TYPE_TEMPLATES.find((template) => template.id === id) || null
}
