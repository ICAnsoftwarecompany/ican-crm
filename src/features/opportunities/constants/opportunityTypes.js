import {
  Sparkles,
  Cog,
  Megaphone,
  Users,
  MessageCircle,
  Phone,
  CalendarClock,
  Headset,
  UserPlus,
  MoreHorizontal,
} from 'lucide-react'

export const OPPORTUNITY_TYPES = [
  { value: 'new_sale', label: 'بيع جديد' },
  { value: 'cross_sell', label: 'بيع تكميلي' },
  { value: 'upsell', label: 'ترقية باقة' },
  { value: 'expansion', label: 'توسع' },
  { value: 'renewal', label: 'تجديد' },
  { value: 'reactivation', label: 'إعادة تفعيل' },
  { value: 'buying_intent', label: 'نية شراء' },
  { value: 'campaign_engagement', label: 'تفاعل حملة' },
  { value: 'referral', label: 'إحالة' },
  { value: 'other', label: 'أخرى' },
]

export const OPPORTUNITY_STATUSES = [
  { value: 'new', label: 'جديدة', variant: 'info' },
  { value: 'reviewing', label: 'قيد المراجعة', variant: 'warning' },
  { value: 'watching', label: 'تحت المراقبة', variant: 'purple' },
  { value: 'qualified', label: 'مؤهلة', variant: 'ai' },
  { value: 'activated', label: 'مفعّلة', variant: 'success' },
  { value: 'dismissed', label: 'مرفوضة', variant: 'danger' },
  { value: 'expired', label: 'منتهية', variant: 'default' },
]

export const OPPORTUNITY_PRIORITIES = [
  { value: 'high', label: 'عالية', color: '#EF4444' },
  { value: 'medium', label: 'متوسطة', color: '#F59E0B' },
  { value: 'low', label: 'منخفضة', color: '#10B981' },
]

export const OPPORTUNITY_SOURCES = [
  { value: 'ai', label: 'AI', icon: Sparkles, color: '#00C2CB' },
  { value: 'system_rule', label: 'قاعدة نظام', icon: Cog, color: '#8B5CF6' },
  { value: 'segment', label: 'تصنيف', icon: Users, color: '#3B82F6' },
  { value: 'campaign', label: 'حملة', icon: Megaphone, color: '#F59E0B' },
  { value: 'conversation', label: 'محادثة', icon: MessageCircle, color: '#10B981' },
  { value: 'call', label: 'مكالمة', icon: Phone, color: '#0EA5E9' },
  { value: 'meeting', label: 'اجتماع', icon: CalendarClock, color: '#6366F1' },
  { value: 'customer_service', label: 'خدمة عملاء', icon: Headset, color: '#EC4899' },
  { value: 'manual', label: 'يدوي', icon: UserPlus, color: '#64748B' },
  { value: 'other', label: 'أخرى', icon: MoreHorizontal, color: '#94A3B8' },
]

export const OPPORTUNITY_SIGNAL_TYPES = [
  { value: 'ai_conversation', label: 'محادثة AI', icon: Sparkles },
  { value: 'segment_match', label: 'تطابق تصنيف', icon: Users },
  { value: 'campaign_event', label: 'حدث حملة', icon: Megaphone },
  { value: 'manual_note', label: 'ملاحظة يدوية', icon: UserPlus },
  { value: 'call_report', label: 'تقرير مكالمة', icon: Phone },
  { value: 'meeting_report', label: 'تقرير اجتماع', icon: CalendarClock },
]

export const OPPORTUNITY_DISMISS_REASONS = [
  { value: 'not_relevant', label: 'غير ذات صلة' },
  { value: 'wrong_recommendation', label: 'توصية غير صحيحة' },
  { value: 'already_purchased', label: 'تم الشراء بالفعل' },
  { value: 'no_need', label: 'لا يوجد احتياج' },
  { value: 'bad_timing', label: 'توقيت غير مناسب' },
  { value: 'no_budget', label: 'لا توجد ميزانية' },
  { value: 'duplicate', label: 'فرصة مكررة' },
  { value: 'customer_not_eligible', label: 'العميل غير مؤهل' },
  { value: 'wrong_product', label: 'منتج غير مناسب' },
  { value: 'other', label: 'سبب آخر' },
]

export const OPPORTUNITY_TIMELINE_EVENT_LABELS = {
  detected: 'تم اكتشاف الفرصة',
  signal_added: 'تمت إضافة إشارة جديدة',
  score_changed: 'تغيّر Score الفرصة',
  assigned: 'تم إسناد الفرصة',
  status_changed: 'تغيّرت حالة الفرصة',
  note_added: 'تمت إضافة ملاحظة',
}

const byValue = (list) => new Map(list.map((item) => [item.value, item]))

export const OPPORTUNITY_TYPES_MAP = byValue(OPPORTUNITY_TYPES)
export const OPPORTUNITY_STATUSES_MAP = byValue(OPPORTUNITY_STATUSES)
export const OPPORTUNITY_PRIORITIES_MAP = byValue(OPPORTUNITY_PRIORITIES)
export const OPPORTUNITY_SOURCES_MAP = byValue(OPPORTUNITY_SOURCES)
export const OPPORTUNITY_SIGNAL_TYPES_MAP = byValue(OPPORTUNITY_SIGNAL_TYPES)
export const OPPORTUNITY_DISMISS_REASONS_MAP = byValue(OPPORTUNITY_DISMISS_REASONS)
