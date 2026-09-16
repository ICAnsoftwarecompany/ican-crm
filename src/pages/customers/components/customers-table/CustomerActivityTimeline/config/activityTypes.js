import {
  Activity,
  ArrowRightLeft,
  Calendar,
  CheckSquare,
  CircleX,
  FileText,
  Mail,
  MessageCircle,
  Package,
  Phone,
  StickyNote,
  Trophy,
  UserRound,
} from 'lucide-react'

export const activityTypes = {
  status_change: { label: 'تغيير الحالة', category: 'status', icon: ArrowRightLeft, tone: 'blue' },
  note: { label: 'ملاحظة', category: 'notes', icon: StickyNote, tone: 'amber' },
  'note-to-lead': { label: 'متابعة', category: 'notes', icon: FileText, tone: 'amber' },
  interested_products: { label: 'المنتجات المهتم بها', category: 'products', icon: Package, tone: 'violet' },
  call: { label: 'مكالمة', category: 'communication', icon: Phone, tone: 'emerald' },
  meeting: { label: 'اجتماع', category: 'communication', icon: Calendar, tone: 'cyan' },
  whatsapp: { label: 'واتساب', category: 'communication', icon: MessageCircle, tone: 'green' },
  email: { label: 'بريد إلكتروني', category: 'communication', icon: Mail, tone: 'blue' },
  task: { label: 'مهمة', category: 'task', icon: CheckSquare, tone: 'indigo' },
  assigned: { label: 'تعيين', category: 'assignment', icon: UserRound, tone: 'slate' },
  proposal: { label: 'عرض سعر', category: 'proposal', icon: FileText, tone: 'indigo' },
  deal: { label: 'صفقة', category: 'deal', icon: Trophy, tone: 'emerald', importance: 'milestone' },
  deal_won: { label: 'صفقة ناجحة', category: 'deal', icon: Trophy, tone: 'emerald', importance: 'milestone' },
  deal_lost: { label: 'صفقة مفقودة', category: 'lost', icon: CircleX, tone: 'red', importance: 'milestone' },
  lost: { label: 'خسارة عميل محتمل', category: 'lost', icon: CircleX, tone: 'red', importance: 'milestone' },
  lead_created: { label: 'إنشاء عميل محتمل', category: 'system', icon: Activity, tone: 'slate', importance: 'milestone' },
  customer_created: { label: 'إنشاء عميل', category: 'system', icon: Activity, tone: 'slate', importance: 'milestone' },
  default: { label: 'نشاط', category: 'other', icon: Activity, tone: 'slate' },
}

export const toneClasses = {
  blue: {
    dot: 'bg-blue-50 text-blue-700 border-blue-200',
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
    line: 'bg-blue-100',
  },
  amber: {
    dot: 'bg-amber-50 text-amber-700 border-amber-200',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    line: 'bg-amber-100',
  },
  violet: {
    dot: 'bg-violet-50 text-violet-700 border-violet-200',
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
    line: 'bg-violet-100',
  },
  emerald: {
    dot: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    line: 'bg-emerald-100',
  },
  green: {
    dot: 'bg-green-50 text-green-700 border-green-200',
    badge: 'border-green-200 bg-green-50 text-green-700',
    line: 'bg-green-100',
  },
  cyan: {
    dot: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    badge: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    line: 'bg-cyan-100',
  },
  indigo: {
    dot: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badge: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    line: 'bg-indigo-100',
  },
  red: {
    dot: 'bg-red-50 text-red-700 border-red-200',
    badge: 'border-red-200 bg-red-50 text-red-700',
    line: 'bg-red-100',
  },
  slate: {
    dot: 'bg-slate-100 text-slate-700 border-slate-200',
    badge: 'border-slate-200 bg-slate-100 text-slate-700',
    line: 'bg-slate-200',
  },
}

export function getActivityTypeConfig(type) {
  const key = String(type || '').trim().toLowerCase()
  return activityTypes[key] || activityTypes.default
}
