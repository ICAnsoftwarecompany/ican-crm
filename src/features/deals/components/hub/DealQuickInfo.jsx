import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { History, Package, Users } from 'lucide-react'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'

function Chip({ icon: Icon, tone = 'normal', children, title }) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        tone === 'warn' ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300'
          : tone === 'muted' ? 'border-[var(--border)] text-[var(--text-muted)]'
            : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)]'
      )}
    >
      <Icon size={12} className="shrink-0" /><span className="truncate">{children}</span>
    </span>
  )
}

/** Text of the three quick facts (memoized per language): products, team, last action. */
export function useQuickInfoLabels() {
  const { t, i18n } = useTranslation()
  return useMemo(() => buildLabels(t, i18n.language), [i18n.language, t])
}

function buildLabels(t, language) {
  const products = (info) => {
    if (!info || info.productsCount === null) return t('dealWorkspace.quickInfo.loading')
    if (!info.productsCount) return t('dealWorkspace.quickInfo.noProducts')
    if (info.productMode === 'multi_product' || info.productsCount > 1) return t('dealWorkspace.productMode.productsCount', { count: info.productsCount })
    return t(`dealWorkspace.productMode.deal.${info.productMode || 'single_product'}.title`)
  }
  const team = (info) => {
    if (!info || info.teamCount === null) return t('dealWorkspace.quickInfo.loading')
    return info.teamCount ? t('dealWorkspace.quickInfo.teamCount', { count: info.teamCount }) : t('dealWorkspace.quickInfo.noTeam')
  }
  const lastAction = (info) => {
    const action = info?.lastAction
    if (!action) return info && info.productsCount !== null ? t('dealWorkspace.quickInfo.noActivity') : t('dealWorkspace.quickInfo.loading')
    const text = action.type === 'backend'
      ? (action.by ? t('dealWorkspace.quickInfo.backendBy', { text: action.text, by: action.by }) : action.text)
      : t(`dealWorkspace.quickInfo.actions.${action.type}`, { name: action.name || '' })
    const when = action.at ? formatRelativeTime(action.at, language) : ''
    return when ? `${text} · ${when}` : text
  }
  return { products, team, lastAction }
}

/** Three quick facts of a deal: products (and work template), team, last action. */
export function DealQuickInfo({ info, layout = 'row' }) {
  const { t } = useTranslation()
  const labels = useQuickInfoLabels()
  const productsTone = info?.productsCount === 0 ? 'warn' : info?.productsCount === null || !info ? 'muted' : 'normal'
  const teamTone = info?.teamCount === 0 ? 'warn' : info?.teamCount === null || !info ? 'muted' : 'normal'
  return (
    <div className={cn('flex min-w-0 gap-1.5', layout === 'stack' ? 'flex-col items-start' : 'flex-wrap items-center')}>
      <Chip icon={Package} tone={productsTone} title={t('dealWorkspace.quickInfo.products')}>{labels.products(info)}</Chip>
      <Chip icon={Users} tone={teamTone} title={t('dealWorkspace.quickInfo.team')}>{labels.team(info)}</Chip>
      <Chip icon={History} tone="muted" title={t('dealWorkspace.quickInfo.lastAction')}>{labels.lastAction(info)}</Chip>
    </div>
  )
}
