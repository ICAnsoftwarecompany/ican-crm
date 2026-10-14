import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarClock, CircleCheckBig, CircleX, ExternalLink, Mail, Phone, PhoneCall } from 'lucide-react'
import { toast } from 'sonner'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { EntityTasksPanel } from '../../../tasks'
import { useDealLeadMutations } from '../../hooks/useDealLeads'
import { formatMoney } from '../../utils/dealMoney'
import { LeadStatusBadge } from '../common/DealStatusBadge'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'
import { DealLeadProductsSection } from './DealLeadProductsSection'

function InfoLine({ icon: Icon, children, ltr }) {
  if (!children) return null
  return <div className="flex items-center gap-2 text-sm text-[var(--text)]"><Icon size={14} className="text-[var(--text-muted)]" /><span dir={ltr ? 'ltr' : undefined}>{children}</span></div>
}

/**
 * Everything about one deal lead without leaving the board: contact, stage, owner, products, won/lost,
 * quick call/meeting, and its tasks (shared EntityTasksPanel on the CRM lead).
 */
export function DealLeadDrawer({ dealId, lead, stages, people, open, onClose, actions }) {
  const { t, i18n } = useTranslation()
  const { changeStage, bulkAssign } = useDealLeadMutations(dealId)
  const [busy, setBusy] = useState(false)
  if (!lead) return null
  const isOpen = lead.status === 'open'

  const run = async (fn, successKey) => {
    setBusy(true)
    try {
      await fn()
      toast.success(t(successKey))
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.common.actionFailed')))
    } finally {
      setBusy(false)
    }
  }

  const openStages = stages.filter((stage) => !stage.is_won_stage && !stage.is_lost_stage)

  return (
    <AppDrawer open={open} onClose={onClose} size="lg" drawerKey="deal-lead" title={lead.name || `#${lead.id}`} description={t('dealWorkspace.leads.drawer.description')}>
      <div className="space-y-5">
        <section className="space-y-2 rounded-lg border border-[var(--border)] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <LeadStatusBadge status={lead.status} />
            {lead.customerId && (
              <Link to={`/leads/${lead.customerId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-accent)] hover:underline">
                <ExternalLink size={13} />{t('dealWorkspace.leads.drawer.openRecord')}
              </Link>
            )}
          </div>
          <InfoLine icon={Phone} ltr>{lead.phone}</InfoLine>
          <InfoLine icon={Mail} ltr>{lead.email}</InfoLine>
          {lead.estimatedValue > 0 && <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.fields.estimatedValue')}: <strong dir="ltr" className="text-[var(--text)]">{formatMoney(lead.estimatedValue, i18n.language)}</strong></p>}
          {lead.status === 'lost' && lead.lostReason && <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.closing.lost.reason')}: {t(`dealWorkspace.options.lostReason.${lead.lostReason}`, lead.lostReason)}</p>}
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel label={t('dealWorkspace.fields.stage')}>
            <select
              className={dealInputClass}
              value={lead.stage_id ?? ''}
              disabled={!isOpen || busy}
              onChange={(event) => run(() => changeStage.mutateAsync({ dealLeadId: lead.id, stageId: event.target.value }), 'dealWorkspace.leads.drawer.stageChanged')}
            >
              {openStages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
              {!openStages.some((stage) => String(stage.id) === String(lead.stage_id)) && <option value={lead.stage_id ?? ''}>{stages.find((stage) => String(stage.id) === String(lead.stage_id))?.label || '—'}</option>}
            </select>
          </FieldLabel>
          <FieldLabel label={t('dealWorkspace.fields.owner')}>
            <PersonSelect
              people={people}
              value={lead.ownerId ? String(lead.ownerId) : ''}
              disabled={busy}
              onChange={(value) => value && run(() => bulkAssign.mutateAsync({ dealLeadIds: [lead.id], ownerId: Number(value) || value }), 'dealWorkspace.leads.drawer.ownerChanged')}
            />
          </FieldLabel>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => actions.onSchedule(lead, 'call')}><PhoneCall size={14} />{t('dealWorkspace.leads.actions.call')}</Button>
          <Button size="sm" variant="outline" onClick={() => actions.onSchedule(lead, 'meeting')}><CalendarClock size={14} />{t('dealWorkspace.leads.actions.meeting')}</Button>
          <Button size="sm" variant="accent" disabled={!isOpen} onClick={() => actions.onWon(lead)}><CircleCheckBig size={14} />{t('dealWorkspace.leads.actions.won')}</Button>
          <Button size="sm" variant="danger" disabled={!isOpen} onClick={() => actions.onLost(lead)}><CircleX size={14} />{t('dealWorkspace.leads.actions.lost')}</Button>
        </div>

        <DealLeadProductsSection dealId={dealId} lead={lead} />

        {lead.leadId && <EntityTasksPanel taskable={{ type: 'lead', id: lead.leadId, name: lead.name }} />}
      </div>
    </AppDrawer>
  )
}
