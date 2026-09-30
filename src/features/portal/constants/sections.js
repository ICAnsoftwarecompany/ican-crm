import { Building2, CreditCard, FileText, HelpCircle, Home, Inbox, LayoutGrid, PackageOpen, ShieldCheck } from 'lucide-react'

/**
 * Portal navigation. A section shows when the tenant enabled it (portal settings `sections`) AND the active
 * membership's policy allows at least one of its objects. `path` is relative to the portal router.
 */
export const PORTAL_SECTIONS = [
  { key: 'home', path: '/', icon: Home, always: true },
  { key: 'records', path: '/services', icon: LayoutGrid, visible: ({ recordTypes }) => recordTypes.length > 0 },
  { key: 'cases', path: '/requests', icon: Inbox, visible: ({ can }) => can('case') },
  { key: 'catalog', path: '/catalog', icon: PackageOpen, visible: ({ can }) => can('catalog') },
  { key: 'payments', path: '/payments', icon: CreditCard, visible: ({ can }) => can('payment_schedule') || can('remittance') },
  { key: 'assets', path: '/assets', icon: ShieldCheck, visible: ({ can }) => can('asset') || can('entitlement') || can('subscription') || can('contract') },
  { key: 'documents', path: '/documents', icon: FileText, visible: ({ can }) => can('document') },
  { key: 'kb', path: '/help', icon: HelpCircle, visible: ({ can }) => can('kb') || can('feedback', 'create') },
  { key: 'company', path: '/company', icon: Building2, always: false, visible: ({ can }) => can('org_users') },
]

export function visibleSections({ settings, can, recordTypes }) {
  const enabled = new Set(settings?.sections || [])
  return PORTAL_SECTIONS.filter((section) => {
    if (section.always) return true
    // `company` is not a tenant toggle: it follows the B2B admin permission only.
    if (section.key !== 'company' && settings && !enabled.has(section.key)) return false
    return section.visible({ can, recordTypes })
  })
}
