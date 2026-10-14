import { useTranslation } from 'react-i18next'
import { CalendarDays, ChartNoAxesCombined, List, Mail, MessageCircle, Plus, Radio, Workflow } from 'lucide-react'
import { SubSidebar } from '../../../shared/components/sub-sidebar'
import { CAMPAIGN_CHANNEL_LIST } from '../config/campaignChannels'

const BASE = '/outreach-campaigns'
const primary = [
  { path: '', key: 'overview', icon: ChartNoAxesCombined, end: true },
  { path: 'live', key: 'live', icon: Radio },
  { path: 'all', key: 'all', icon: List },
  { path: 'create', key: 'create', icon: Plus },
]
const future = [
  { key: 'tiktok', icon: Radio },
  { key: 'telegram', icon: MessageCircle },
  { key: 'snapchat', icon: Mail },
]
const tools = [
  { path: 'calendar', key: 'calendar', icon: CalendarDays },
  { path: 'workflow', key: 'workflow', icon: Workflow },
]

const toPath = (path) => (path ? `${BASE}/${path}` : BASE)

/** Outreach Campaigns internal navigation — built on the shared sub-sidebar (2026-10-01). */
export function OutreachSidebar({ onNavigate, collapsed = false, onToggleCollapse, framed = true }) {
  const { t } = useTranslation()
  const label = (key) => t(`outreachCampaigns.navigation.${key}`)

  const groups = [
    { id: 'primary', items: primary.map((item) => ({ id: item.key, to: toPath(item.path), label: label(item.key), icon: item.icon, end: item.end })) },
    {
      id: 'channels',
      label: label('channels'),
      note: label('comingSoon'),
      items: [
        ...CAMPAIGN_CHANNEL_LIST.map((channel) => ({ id: channel.key, to: toPath(`channels/${channel.key}`), label: t(channel.labelKey), icon: channel.icon })),
        ...future.map((item) => ({ id: item.key, to: toPath(`channels/${item.key}`), label: label(item.key), icon: item.icon, disabled: true })),
      ],
    },
    { id: 'tools', label: label('tools'), divider: true, items: tools.map((item) => ({ id: item.key, to: toPath(item.path), label: label(item.key), icon: item.icon })) },
  ]

  return (
    <SubSidebar
      variant={framed ? 'framed' : 'plain'}
      header={{
        title: t('outreachCampaigns.pageTitle'),
        expandLabel: label('expandNavigation'),
        collapseLabel: label('collapseNavigation'),
      }}
      groups={groups}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      onNavigate={onNavigate}
    />
  )
}
