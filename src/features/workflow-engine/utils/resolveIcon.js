import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  CheckSquare,
  Circle,
  CircleStop,
  Eye,
  Flag,
  GitBranch,
  Clock,
  Mail,
  MessageCircle,
  MessageSquare,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Send,
  StickyNote,
  Tag,
  Target,
  Trophy,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'

/**
 * Definitions store `icon` as a plain string (see registry JSDoc) so that
 * registry/workflowRegistry.js and module definition files never import
 * React/JSX — only the rendering layer (here) resolves the name to an
 * actual icon component.
 *
 * This is an explicit map (not `import * as LucideIcons`) so unused icons
 * stay tree-shaken — a wildcard import pulled the entire icon library into
 * the bundle (~800KB) for a feature that only ever needs the handful of
 * icons its own registered definitions reference. Add a new icon here
 * when a new definition needs one — see docs section 30 "طريقة إضافة Action".
 */
const ICONS = {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  CheckSquare,
  Circle,
  CircleStop,
  Eye,
  Flag,
  GitBranch,
  Clock,
  Mail,
  MessageCircle,
  MessageSquare,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Send,
  StickyNote,
  Tag,
  Target,
  Trophy,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
  Zap,
}

export function resolveWorkflowIcon(name, fallbackName = 'Circle') {
  return ICONS[name] || ICONS[fallbackName] || Circle
}
