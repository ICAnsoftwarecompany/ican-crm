import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Search, ShoppingBag, UsersRound } from 'lucide-react'

const FEATURES = [
  {
    "group": "sales",
    "id": "leads",
    "status": "live"
  },
  {
    "group": "sales",
    "id": "lead360",
    "status": "live"
  },
  {
    "group": "sales",
    "id": "statuses",
    "status": "live"
  },
  {
    "group": "sales",
    "id": "assignment",
    "status": "partial"
  },
  {
    "group": "sales",
    "id": "activities",
    "status": "live"
  },
  {
    "group": "sales",
    "id": "tasks",
    "status": "live"
  },
  {
    "group": "sales",
    "id": "deals",
    "status": "live"
  },
  {
    "group": "sales",
    "id": "proposals",
    "status": "live"
  },
  {
    "group": "sales",
    "id": "catalog",
    "status": "live"
  },
  {
    "group": "sales",
    "id": "conversations",
    "status": "live"
  },
  {
    "group": "sales",
    "id": "campaigns",
    "status": "partial"
  },
  {
    "group": "sales",
    "id": "automation",
    "status": "partial"
  },
  {
    "group": "sales",
    "id": "reports",
    "status": "partial"
  },
  {
    "group": "sales",
    "id": "data",
    "status": "live"
  },
  {
    "group": "service",
    "id": "cases",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "sla",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "contacts",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "records",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "assets",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "contracts",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "billing",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "scheduling",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "portal",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "knowledge",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "quality",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "insights",
    "status": "demo"
  },
  {
    "group": "service",
    "id": "config",
    "status": "demo"
  }
]

export function AboutCrmPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const groups = [
    { id: 'sales', icon: ShoppingBag },
    { id: 'service', icon: UsersRound },
  ]
  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    return FEATURES.filter(({ group, id }) =>
      (selectedGroup === 'all' || group === selectedGroup) &&
      (!term || [t(`settings.about.items.${id}.title`), t(`settings.about.items.${id}.description`)].join(' ').toLocaleLowerCase().includes(term))
    )
  }, [query, selectedGroup, t])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-10">
      <header className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-[var(--brand-accent-soft)] p-3 text-[var(--ai-text)]"><BookOpen size={25} /></span>
          <div>
            <h1 className="text-2xl font-black text-[var(--text)]">{t('settings.about.title')}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('settings.about.subtitle')}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">{t('settings.about.overview')}</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('settings.about.title')}>
          {['all', ...groups.map(({ id }) => id)].map((id) => (
            <button key={id} type="button" onClick={() => setSelectedGroup(id)}
              aria-pressed={selectedGroup === id}
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${selectedGroup === id ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--ai-text)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]'}`}>
              {t(`settings.about.${id}`)}
              <span className="ms-2 opacity-70">{id === 'all' ? FEATURES.length : FEATURES.filter((feature) => feature.group === id).length}</span>
            </button>
          ))}
        </div>
        <label className="flex min-w-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 sm:w-72">
          <Search size={17} className="shrink-0 text-[var(--text-muted)]" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder={t('settings.about.search')} aria-label={t('settings.about.search')}
            className="w-full min-w-0 bg-transparent text-sm text-[var(--text)] outline-none" />
        </label>
      </div>

      {groups.map(({ id: group, icon: Icon }) => {
        const items = visible.filter((feature) => feature.group === group)
        if (!items.length) return null
        return (
          <section key={group} aria-label={t(`settings.about.${group}`)} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon size={20} className="text-[var(--ai-text)]" />
              <h2 className="text-lg font-black text-[var(--text)]">{t(`settings.about.${group}`)}</h2>
              <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--text-muted)]">{items.length} {t('settings.about.features')}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map(({ id, status }) => (
                <article key={id} className="flex min-w-0 flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-[var(--text)]">{t(`settings.about.items.${id}.title`)}</h3>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-[10px] font-bold text-[var(--text-muted)]">{t(`settings.about.statuses.${status}`)}</span>
                  </div>
                  <p className="text-sm leading-7 text-[var(--text-muted)]">{t(`settings.about.items.${id}.description`)}</p>
                </article>
              ))}
            </div>
          </section>
        )
      })}
      {!visible.length && <p className="rounded-xl border border-[var(--border)] p-8 text-center text-sm text-[var(--text-muted)]">{t('settings.about.noResults')}</p>}
      <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-xs leading-6 text-[var(--text-muted)]">{t('settings.about.notice')}</p>
    </div>
  )
}
