import {
  BarChart3,
  BellRing,
  CalendarDays,
  ClipboardCheck,
  CopyCheck,
  FileSignature,
  Filter,
  GitBranch,
  Handshake,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  NotebookPen,
  PhoneCall,
  Radio,
  Route,
  Scale,
  Tags,
  Target,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  UsersRound,
  Video,
  Workflow,
  Zap,
} from 'lucide-react'

/**
 * Slides of the login showcase. Copy lives in locales under
 * `auth.showcase.slides.<id>.{title, subtitle, points.<pointId>}`; this file
 * only owns the order, the icons and where the background light moves to
 * for each slide.
 *
 * To add a slide: add an entry here and its keys in BOTH locales/ar/auth.js
 * and locales/en/auth.js (check:i18n enforces parity). Keep 4 points per
 * slide so the grid stays even.
 *
 * `light` is the position the background light composition glides to
 * (x/y in vw/vh, r in degrees) while the slide is shown.
 */
export const SHOWCASE_SLIDES = [
  {
    id: 'overview',
    icon: LayoutDashboard,
    light: { x: 0, y: 0, r: 0 },
    points: [
      { id: 'leads', icon: Target },
      { id: 'inbox', icon: Inbox },
      { id: 'teams', icon: UsersRound },
      { id: 'reports', icon: BarChart3 },
    ],
  },
  {
    id: 'customers',
    icon: Users,
    light: { x: -8, y: 6, r: -8 },
    points: [
      { id: 'pipeline', icon: GitBranch },
      { id: 'segments', icon: Tags },
      { id: 'duplicates', icon: CopyCheck },
      { id: 'import', icon: Upload },
    ],
  },
  {
    id: 'teams',
    icon: Route,
    light: { x: 10, y: -4, r: 10 },
    points: [
      { id: 'rules', icon: Filter },
      { id: 'balance', icon: Scale },
      { id: 'managers', icon: UserCheck },
      { id: 'myWork', icon: ClipboardCheck },
    ],
  },
  {
    id: 'calls',
    icon: CalendarDays,
    light: { x: -4, y: -8, r: 6 },
    points: [
      { id: 'schedule', icon: PhoneCall },
      { id: 'meetings', icon: Video },
      { id: 'reports', icon: NotebookPen },
      { id: 'reminders', icon: BellRing },
    ],
  },
  {
    id: 'conversations',
    icon: MessagesSquare,
    light: { x: 8, y: 8, r: -12 },
    points: [
      { id: 'whatsapp', icon: MessageCircle },
      { id: 'messenger', icon: MessagesSquare },
      { id: 'gmail', icon: Mail },
      { id: 'realtime', icon: Radio },
    ],
  },
  {
    id: 'campaigns',
    icon: Megaphone,
    light: { x: -10, y: -2, r: 14 },
    points: [
      { id: 'meta', icon: Megaphone },
      { id: 'leadForms', icon: Target },
      { id: 'outreach', icon: Zap },
      { id: 'cost', icon: TrendingUp },
    ],
  },
  {
    id: 'automation',
    icon: Workflow,
    light: { x: 4, y: 10, r: -4 },
    points: [
      { id: 'workflows', icon: Workflow },
      { id: 'proposals', icon: FileSignature },
      { id: 'deals', icon: Handshake },
      { id: 'analytics', icon: BarChart3 },
    ],
  },
]

/** Time each slide stays on screen while auto-playing. */
export const SHOWCASE_INTERVAL_MS = 7000
