import { useTranslation } from 'react-i18next'
import { DIALOG_KINDS, countKinds } from './productsDialogItems'

/** "Products 2 · Services 1 · Plans 1" — only the kinds present (2026-10-15). */
export function KindCounts({ items }) {
  const { t } = useTranslation()
  const counts = countKinds(items)
  const parts = DIALOG_KINDS.filter((kind) => counts[kind] > 0).map((kind) => `${t(`leads.interestDialog.kinds.${kind}`)} ${counts[kind]}`)
  return <p className="text-xs text-[var(--text-muted)]">{parts.join(' · ') || t('leads.interestView.noItems')}</p>
}
