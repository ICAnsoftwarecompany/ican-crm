import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarClock, PhoneCall, Users } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { Badge } from '../../../../shared/components/ui/Badge'
import { Button } from '../../../../shared/components/ui/Button'
import { Tabs } from '../../../../shared/components/ui/Tabs'
import { formatDate, formatTime } from '../../../../shared/utils/dateTime'
import { ScheduleActivityDialog } from '../../../activities'
import { ActivityPreviewDrawer } from '../../../calendar'
import { isDealApiLive } from '../../constants/dealApiStatus'
import { useDealActivities } from '../../hooks/useDealLinkedWork'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { PlannedNotice } from '../common/PlannedNotice'
import { PickDealLeadDialog } from './PickDealLeadDialog'

/**
 * Calls or meetings of the deal. Customer ones = with a lead of the deal (works on today's API).
 * Internal ones = team meetings linked to the deal itself (taskable `App\Models\Deal`, planned backend support).
 */
export function DealActivitiesPanel({ type }) {
  const { t, i18n } = useTranslation()
  const { dealId } = useDealWorkspace()
  const query = useDealActivities(type)
  const [scope, setScope] = useState('all')
  const [picking, setPicking] = useState(false)
  const [schedule, setSchedule] = useState(null)
  const [preview, setPreview] = useState(null)
  const internalLive = isDealApiLive('dealLinkedActivities')
  const isMeeting = type === 'meeting'

  const items = useMemo(() => query.items.filter((item) => scope === 'all' || item.dealLink === scope), [query.items, scope])
  const list = (
    <ResourceState
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      empty={!items.length}
      emptyIcon={isMeeting ? <CalendarClock size={24} /> : <PhoneCall size={24} />}
      emptyTitle={t(`dealWorkspace.activities.${type}.emptyTitle`)}
      emptyDescription={t(`dealWorkspace.activities.${type}.emptyDescription`)}
    >
      <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => setPreview(item)} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-start hover:bg-[var(--surface-2)]">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[var(--text)]">{item.title}</span>
                <span className="block text-xs text-[var(--text-muted)]">
                  {item.startAt ? `${formatDate(item.startAt, i18n.language)} · ${formatTime(item.startAt, i18n.language)}` : '—'}
                  {item.relatedEntity?.name ? ` · ${item.relatedEntity.name}` : ''}
                  {item.assignedUser?.name ? ` · ${item.assignedUser.name}` : ''}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Badge variant={item.dealLink === 'internal' ? 'purple' : 'info'}>{t(`dealWorkspace.activities.scopes.${item.dealLink}`)}</Badge>
                <Badge>{t(`dealWorkspace.activities.status.${item.status}`, item.status)}</Badge>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </ResourceState>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">{t(`dealWorkspace.activities.${type}.description`)}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setPicking(true)}>{isMeeting ? <CalendarClock size={15} /> : <PhoneCall size={15} />}{t(`dealWorkspace.activities.${type}.withCustomer`)}</Button>
          {isMeeting && (
            <Button size="sm" variant="outline" disabled={!internalLive} title={internalLive ? undefined : t('dealWorkspace.planned.dealLinkedActivities')} onClick={() => setSchedule({ internal: true })}>
              <Users size={15} />{t('dealWorkspace.activities.meeting.internal')}
            </Button>
          )}
        </div>
      </div>
      {isMeeting && <PlannedNotice capability="dealLinkedActivities" />}
      {isMeeting ? (
        <Tabs
          variant="underline"
          active={scope}
          onChange={setScope}
          items={['all', 'customer', 'internal'].map((id) => ({ id, label: t(`dealWorkspace.activities.scopes.${id}`), content: list }))}
        />
      ) : list}
      <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.activities.scopeNote')}</p>

      <PickDealLeadDialog
        open={picking}
        onClose={() => setPicking(false)}
        title={t(`dealWorkspace.activities.${type}.withCustomer`)}
        onPick={(lead) => {
          setPicking(false)
          if (lead) setSchedule({ lead })
        }}
      />
      {schedule && (
        <ScheduleActivityDialog
          type={type}
          isOpen
          relatedType="lead"
          {...(schedule.internal
            ? { taskableType: 'App\\Models\\Deal', taskableId: dealId, defaultTitle: t('dealWorkspace.activities.meeting.internalTitle') }
            : { leadId: schedule.lead.leadId, defaultPhone: schedule.lead.phone, assignedUserId: schedule.lead.ownerId || undefined, defaultTitle: t(`dealWorkspace.leads.scheduleTitle.${type}`, { name: schedule.lead.name }) })}
          avoidCustomerDetailsDrawer
          onClose={() => setSchedule(null)}
          onCreated={() => {
            setSchedule(null)
            query.refetch()
          }}
        />
      )}
      <ActivityPreviewDrawer activity={preview} open={Boolean(preview)} onClose={() => setPreview(null)} onSaved={query.refetch} />
    </div>
  )
}
