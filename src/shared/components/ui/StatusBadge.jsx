import { useTranslation } from 'react-i18next'

const STATUS_STYLES = {
  new:       { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  contacted: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  qualified: { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE' },
  won:       { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  lost:      { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
  active:    { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  inactive:  { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' },
}

export function StatusBadge({ statusKey }) {
  const { t } = useTranslation()
  const colors = STATUS_STYLES[statusKey] || STATUS_STYLES.new

  return (
    <span
      style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}
      className="px-2.5 py-1 rounded-full text-xs font-medium border font-arabic"
    >
      {t(`status.${statusKey}`, statusKey)}
    </span>
  )
}
