import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageCircle, MessagesSquare, Plus, X } from 'lucide-react'
import { useLocalStorage } from '../../../../shared/components/data-table/hooks/useLocalStorage'
import { cn } from '../../../../shared/utils/cn'
import { GmailLogoIcon, GmailSidebarPanel, MessengerLogoIcon, MessengerSidebarPanel, WhatsappLogoIcon, WhatsappSidebarPanel } from '../../../conversations'
import { InternalChatSidebarPanel } from '../../../internal-chat'
import { getDealPagePath } from '../../constants/dealWorkspacePages'
import { useDealConversationFilter } from '../../hooks/useDealChat'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { useDealChatGroups } from './useDealChatGroups'

const CHANNELS = [
  { id: 'whatsapp', Logo: WhatsappLogoIcon, Panel: WhatsappSidebarPanel },
  { id: 'messenger', Logo: MessengerLogoIcon, Panel: MessengerSidebarPanel },
  { id: 'gmail', Logo: GmailLogoIcon, Panel: GmailSidebarPanel },
]
// Widths of the side panels (same as their own classes), so the dock moves beside an open panel.
const PANEL_WIDTH = { groups: 'min(520px, 100vw - 72px)', channel: 'min(390px, 100vw - 72px)' }

const dockButton = 'relative inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-colors'

/**
 * Two floating buttons on the side of every deal page (2026-10-16):
 * 1. conversations of every channel (WhatsApp / Messenger / Gmail side panels) — the deal's customers by default, or all;
 * 2. this deal's internal groups ("<deal name> G<n>") in the team chat panel, with "new group".
 * Panels mount on first use; one is open at a time.
 */
export function DealChatDock() {
  const { t } = useTranslation()
  const { dealId, leads } = useDealWorkspace()
  const { dealName, groups, newGroup } = useDealChatGroups()
  const conversations = useDealConversationFilter(leads)
  const [panel, setPanel] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState([])
  const [scope, setScope] = useLocalStorage('deal-chat-dock:scope', 'deal')
  const scoped = scope !== 'all'

  const filters = useMemo(() => Object.fromEntries(CHANNELS.map(({ id }) => [id, scoped ? (raw) => conversations.filter(raw, id) : null])), [conversations, scoped])
  const open = (id) => {
    setMenuOpen(false)
    setPanel((current) => (current === id ? null : id))
    setMounted((current) => (current.includes(id) ? current : [...current, id]))
  }
  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') { setMenuOpen(false); setPanel(null) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const offset = panel === 'groups' ? PANEL_WIDTH.groups : panel ? PANEL_WIDTH.channel : '0px'

  return (
    <>
      <div className="fixed top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2 transition-[inset-inline-end] duration-300" style={{ insetInlineEnd: `calc(${offset} + 12px)` }}>
        <div className="relative">
          <button type="button" onClick={() => { setMenuOpen((value) => !value); if (CHANNELS.some((channel) => channel.id === panel)) setPanel(null) }} aria-expanded={menuOpen} aria-label={t('dealWorkspace.chatDock.conversations')} title={t('dealWorkspace.chatDock.conversations')}
            className={cn(dockButton, menuOpen || CHANNELS.some((channel) => channel.id === panel) ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--brand-accent)] hover:bg-[var(--brand-accent-soft)]')}>
            <MessageCircle size={20} />
          </button>
          {menuOpen && (
            <div role="dialog" aria-label={t('dealWorkspace.chatDock.conversations')} className="absolute end-full top-0 me-2 w-64 space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.chatDock.conversations')}</h3>
                <button type="button" onClick={() => setMenuOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]" aria-label={t('dealWorkspace.common.close')}><X size={14} /></button>
              </div>
              <div role="radiogroup" aria-label={t('dealWorkspace.chatDock.scope')} className="grid grid-cols-2 gap-1 rounded-lg bg-[var(--surface-2)] p-1">
                {['deal', 'all'].map((value) => (
                  <button key={value} type="button" role="radio" aria-checked={(value === 'deal') === scoped} onClick={() => setScope(value)}
                    className={cn('rounded-md px-2 py-1.5 text-xs font-semibold', (value === 'deal') === scoped ? 'bg-[var(--surface)] text-[var(--brand-accent)] shadow-sm' : 'text-[var(--text-muted)]')}>
                    {t(`dealWorkspace.chatDock.scopes.${value}`)}
                  </button>
                ))}
              </div>
              {scoped && <p className="text-[11px] leading-4 text-[var(--text-muted)]">{conversations.isEmpty ? t('dealWorkspace.chatDock.noCustomers') : t('dealWorkspace.chatDock.scopeHint', { count: conversations.contacts })}</p>}
              <ul className="space-y-1">
                {CHANNELS.map(({ id, Logo }) => (
                  <li key={id}>
                    <button type="button" onClick={() => open(id)} className="flex w-full items-center gap-2 rounded-md border border-[var(--border)] px-2.5 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]">
                      <Logo size={20} />{t(`dealWorkspace.chatDock.channels.${id}`)}
                    </button>
                  </li>
                ))}
              </ul>
              <Link to={getDealPagePath(dealId, 'conversations')} onClick={() => setMenuOpen(false)} className="block text-xs font-semibold text-[var(--brand-accent)] hover:underline">{t('dealWorkspace.chatDock.openPage')}</Link>
            </div>
          )}
        </div>
        <button type="button" onClick={() => open('groups')} aria-pressed={panel === 'groups'} aria-label={t('dealWorkspace.chatDock.groups')} title={t('dealWorkspace.chatDock.groups')}
          className={cn(dockButton, panel === 'groups' ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--brand-accent)] hover:bg-[var(--brand-accent-soft)]')}>
          <MessagesSquare size={20} />
          {groups.unread > 0 && <span className="absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{groups.unread > 99 ? '99+' : groups.unread}</span>}
        </button>
      </div>

      {CHANNELS.filter(({ id }) => mounted.includes(id)).map(({ id, Panel }) => (
        <Panel key={`${id}-${scoped ? 'deal' : 'all'}`} open={panel === id} onClose={() => setPanel(null)} conversationFilter={filters[id]} />
      ))}
      {mounted.includes('groups') && (
        <InternalChatSidebarPanel
          open={panel === 'groups'}
          onClose={() => setPanel(null)}
          conversationFilter={groups.filter}
          title={t('dealWorkspace.dealGroups.panelTitle', { count: groups.groups.length })}
          openPagePath={getDealPagePath(dealId, 'groups')}
          headerExtra={<button type="button" onClick={newGroup.open} disabled={!dealName} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-accent)] hover:underline disabled:opacity-50"><Plus size={13} />{t('dealWorkspace.dealGroups.new')}</button>}
          emptyList={<p className="p-3 text-center text-xs leading-5 text-[var(--text-muted)]">{t('dealWorkspace.dealGroups.emptyDescription', { name: groups.nextName })}</p>}
        />
      )}
      {newGroup.dialog}
    </>
  )
}
