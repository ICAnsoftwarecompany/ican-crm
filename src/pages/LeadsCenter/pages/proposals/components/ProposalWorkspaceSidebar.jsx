import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen, FilePlus2, Files, LayoutTemplate, Settings2, Workflow, FileText } from 'lucide-react'
import { BrandLogo } from '../../../../../shared/components/brand/BrandLogo'

const BASE = '/LeadsCenter/proposals'
const links = [
  { id: 'list', to: BASE, icon: Files, end: true },
  { id: 'new', to: BASE + '?action=new', icon: FilePlus2 },
  { id: 'templates', to: BASE + '/templates', icon: LayoutTemplate },
  { id: 'settings', to: BASE + '?view=settings', icon: Settings2 },
  { id: 'automation', to: BASE + '?view=automation', icon: Workflow },
]

export function ProposalWorkspaceSidebar({ collapsed }) {
  const { t } = useTranslation()
  const location = useLocation()
  const isBuilder = /\/builder\/?$/.test(location.pathname)
  const active = isBuilder ? 'list' : location.pathname.endsWith('/templates') ? 'templates' :
    new URLSearchParams(location.search).get('view') || (new URLSearchParams(location.search).get('action') === 'new' ? 'new' : 'list')
  return (
    <aside className={`fixed inset-y-0 start-0 z-30 flex flex-col border-e border-[var(--border)] bg-[var(--shell-surface)] text-[var(--text)] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-4">
        <BrandLogo size={32} />
        {!collapsed && <span className="min-w-0 truncate text-sm font-bold">{t('proposals.workspace.title')}</span>}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2" aria-label={t('proposals.workspace.title')}>
        {links.map(({ id, to, icon: Icon }) => (
          <NavLink key={id} to={to} title={t('proposals.workspace.' + id)}
            aria-current={active === id ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active === id ? 'bg-[var(--shell-active)] font-bold text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--text)]'}`}>
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{t('proposals.workspace.' + id)}</span>}
          </NavLink>
        ))}
        {isBuilder && <div className="mt-4 rounded-lg border border-[var(--border)] p-3 text-xs text-[var(--text-muted)]">{!collapsed && t('proposals.workspace.builderHint')}</div>}
      </nav>
      <div className="border-t border-[var(--border)] p-2">
        <NavLink to="/LeadsCenter" title={t('proposals.workspace.back')} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--shell-hover)]">
          <ArrowLeft size={18}/>{!collapsed && t('proposals.workspace.back')}
        </NavLink>
      </div>
    </aside>
  )
}
