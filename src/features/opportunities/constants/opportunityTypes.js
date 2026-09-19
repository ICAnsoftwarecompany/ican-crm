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

export function getOpportunityTypes(t) {
  return [
    { value: 'new_sale', label: t('opportunities.types.new_sale') },
    { value: 'cross_sell', label: t('opportunities.types.cross_sell') },
    { value: 'upsell', label: t('opportunities.types.upsell') },
    { value: 'expansion', label: t('opportunities.types.expansion') },
    { value: 'renewal', label: t('opportunities.types.renewal') },
    { value: 'reactivation', label: t('opportunities.types.reactivation') },
    { value: 'buying_intent', label: t('opportunities.types.buying_intent') },
    { value: 'campaign_engagement', label: t('opportunities.types.campaign_engagement') },
    { value: 'referral', label: t('opportunities.types.referral') },
    { value: 'other', label: t('opportunities.types.other') },
  ]
}

export function getOpportunityStatuses(t) {
  return [
    { value: 'new', label: t('opportunities.statuses.new'), variant: 'info' },
    { value: 'reviewing', label: t('opportunities.statuses.reviewing'), variant: 'warning' },
    { value: 'watching', label: t('opportunities.statuses.watching'), variant: 'purple' },
    { value: 'qualified', label: t('opportunities.statuses.qualified'), variant: 'ai' },
    { value: 'activated', label: t('opportunities.statuses.activated'), variant: 'success' },
    { value: 'dismissed', label: t('opportunities.statuses.dismissed'), variant: 'danger' },
    { value: 'expired', label: t('opportunities.statuses.expired'), variant: 'default' },
  ]
}

export function getOpportunityPriorities(t) {
  return [
    { value: 'high', label: t('activities.scheduleDialog.priorityOptions.high'), color: '#EF4444' },
    { value: 'medium', label: t('activities.scheduleDialog.priorityOptions.medium'), color: '#F59E0B' },
    { value: 'low', label: t('activities.scheduleDialog.priorityOptions.low'), color: '#10B981' },
  ]
}

export function getOpportunitySources(t) {
  return [
    { value: 'ai', label: t('opportunities.sources.ai'), icon: Sparkles, color: '#00C2CB' },
    { value: 'system_rule', label: t('opportunities.sources.system_rule'), icon: Cog, color: '#8B5CF6' },
    { value: 'segment', label: t('opportunities.sources.segment'), icon: Users, color: '#3B82F6' },
    { value: 'campaign', label: t('opportunities.sources.campaign'), icon: Megaphone, color: '#F59E0B' },
    { value: 'conversation', label: t('opportunities.sources.conversation'), icon: MessageCircle, color: '#10B981' },
    { value: 'call', label: t('activities.type.call'), icon: Phone, color: '#0EA5E9' },
    { value: 'meeting', label: t('activities.type.meeting'), icon: CalendarClock, color: '#6366F1' },
    { value: 'customer_service', label: t('opportunities.sources.customer_service'), icon: Headset, color: '#EC4899' },
    { value: 'manual', label: t('opportunities.sources.manual'), icon: UserPlus, color: '#64748B' },
    { value: 'other', label: t('opportunities.sources.other'), icon: MoreHorizontal, color: '#94A3B8' },
  ]
}

export function getOpportunitySignalTypes(t) {
  return [
    { value: 'ai_conversation', label: t('opportunities.signalTypes.ai_conversation'), icon: Sparkles },
    { value: 'segment_match', label: t('opportunities.signalTypes.segment_match'), icon: Users },
    { value: 'campaign_event', label: t('opportunities.signalTypes.campaign_event'), icon: Megaphone },
    { value: 'manual_note', label: t('opportunities.signalTypes.manual_note'), icon: UserPlus },
    { value: 'call_report', label: t('opportunities.signalTypes.call_report'), icon: Phone },
    { value: 'meeting_report', label: t('opportunities.signalTypes.meeting_report'), icon: CalendarClock },
  ]
}

export function getOpportunityDismissReasons(t) {
  return [
    { value: 'not_relevant', label: t('opportunities.dismissReasons.not_relevant') },
    { value: 'wrong_recommendation', label: t('opportunities.dismissReasons.wrong_recommendation') },
    { value: 'already_purchased', label: t('opportunities.dismissReasons.already_purchased') },
    { value: 'no_need', label: t('opportunities.dismissReasons.no_need') },
    { value: 'bad_timing', label: t('opportunities.dismissReasons.bad_timing') },
    { value: 'no_budget', label: t('opportunities.dismissReasons.no_budget') },
    { value: 'duplicate', label: t('opportunities.dismissReasons.duplicate') },
    { value: 'customer_not_eligible', label: t('opportunities.dismissReasons.customer_not_eligible') },
    { value: 'wrong_product', label: t('opportunities.dismissReasons.wrong_product') },
    { value: 'other', label: t('opportunities.dismissReasons.other') },
  ]
}

export function getOpportunityTimelineEventLabels(t) {
  return {
    detected: t('opportunities.timelineEvents.detected'),
    signal_added: t('opportunities.timelineEvents.signal_added'),
    score_changed: t('opportunities.timelineEvents.score_changed'),
    assigned: t('opportunities.timelineEvents.assigned'),
    status_changed: t('opportunities.timelineEvents.status_changed'),
    note_added: t('opportunities.timelineEvents.note_added'),
  }
}

const byValue = (list) => new Map(list.map((item) => [item.value, item]))

export function getOpportunityTypesMap(t) { return byValue(getOpportunityTypes(t)) }
export function getOpportunityStatusesMap(t) { return byValue(getOpportunityStatuses(t)) }
export function getOpportunityPrioritiesMap(t) { return byValue(getOpportunityPriorities(t)) }
export function getOpportunitySourcesMap(t) { return byValue(getOpportunitySources(t)) }
export function getOpportunitySignalTypesMap(t) { return byValue(getOpportunitySignalTypes(t)) }
export function getOpportunityDismissReasonsMap(t) { return byValue(getOpportunityDismissReasons(t)) }
