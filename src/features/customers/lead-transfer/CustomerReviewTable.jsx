import { useTranslation } from 'react-i18next'

export function CustomerReviewTable({ rows, onEdit, disabled }) {
  const { t } = useTranslation()
  return <div className="min-w-0 overflow-x-auto">
    <table className="w-full text-sm text-[var(--text)]"><thead className="bg-[var(--surface-2)]"><tr>{['name', 'phone', 'email', 'company', 'state'].map((key) => <th key={key} className="p-3 text-start">{t(`customers.transfer.${key}`)}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={row.reviewKey ?? index} className="border-b border-[var(--border)]">{['name', 'phone', 'email', 'company'].map((key) => <td key={key} className="max-w-60 break-words p-3">{row.state !== 'saved' && onEdit ? <input disabled={disabled} aria-label={`${t(`customers.transfer.${key}`)} ${index + 1}`} className="h-9 min-w-28 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2" value={row[key] || ''} onChange={(event) => onEdit(row.reviewKey, key, event.target.value)} /> : row[key] || '-'}</td>)}<td className="p-3"><span>{t(`customers.transfer.${row.state || 'pending'}`)}</span>{row.error && <p className="mt-1 max-w-64 text-xs text-red-600 dark:text-red-400">{row.error}</p>}</td></tr>)}</tbody>
    </table>
    {!rows.length && <p className="py-12 text-center text-sm text-[var(--text-muted)]">{t('customers.transfer.empty')}</p>}
  </div>
}
