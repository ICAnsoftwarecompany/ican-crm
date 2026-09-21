import { Clock, Search, X } from 'lucide-react'
import { Input } from '../ui/Input'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function GlobalSearch({ value, onChange, tableId = 'default' }) {
  const { t } = useTranslation()
  const [history, setHistory] = useLocalStorage(`search-history-${tableId}`, [])
  const [isOpen, setIsOpen] = useState(false)

  const saveSearch = (term = value) => {
    const normalized = String(term || '').trim()
    if (!normalized) return

    setHistory((current = []) => {
      const withoutDuplicate = current.filter((item) => item !== normalized)
      return [normalized, ...withoutDuplicate].slice(0, 10)
    })
  }

  const applyHistoryItem = (term) => {
    onChange(term)
    saveSearch(term)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Input
        placeholder={t('dataTable.searchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          saveSearch()
          window.setTimeout(() => setIsOpen(false), 120)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            saveSearch()
            setIsOpen(false)
          }
        }}
        startIcon={<Search size={16} />}
        endIcon={
          value && (
            <button
              onClick={() => onChange('')}
              className="p-1 hover:bg-[var(--surface-2)] rounded transition-colors"
              aria-label={t('dataTable.clearSearch')}
            >
              <X size={16} />
            </button>
          )
        }
      />

      {isOpen && history.length > 0 && (
        <div className="absolute top-11 inset-x-0 z-50 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-[var(--text-muted)]">
            {t('dataTable.recentSearches')}
          </div>
          {history.map((term) => (
            <button
              key={term}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyHistoryItem(term)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
            >
              <Clock size={14} className="text-[var(--text-muted)]" />
              <span className="truncate">{term}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
