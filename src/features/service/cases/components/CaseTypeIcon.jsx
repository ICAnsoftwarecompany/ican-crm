import {
  Banknote,
  Bus,
  CalendarClock,
  FileText,
  FileWarning,
  Hammer,
  HelpCircle,
  Inbox,
  MessageSquareWarning,
  PackagePlus,
  PackageX,
  Receipt,
  ShieldCheck,
  Truck,
  Undo2,
  UserX,
  Wrench,
} from 'lucide-react'

/**
 * Case types carry an icon NAME from tenant config. Only this allowlist is
 * rendered (unknown names fall back to Inbox) — the bundle never imports the
 * whole icon set. Add an icon here when a template needs a new one.
 */
export const CASE_TYPE_ICONS = {
  Banknote,
  Bus,
  CalendarClock,
  FileText,
  FileWarning,
  Hammer,
  HelpCircle,
  MessageSquareWarning,
  PackagePlus,
  PackageX,
  Receipt,
  ShieldCheck,
  Truck,
  Undo2,
  UserX,
  Wrench,
}

export function CaseTypeIcon({ icon, size = 16, className }) {
  const Icon = CASE_TYPE_ICONS[icon] || Inbox
  return <Icon size={size} className={className} aria-hidden="true" />
}
