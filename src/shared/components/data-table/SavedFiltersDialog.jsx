import { useMemo, useState } from 'react'
import { Filter, Plus, Save, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../overlays/AppModal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useLocalStorage } from './hooks/useLocalStorage'

function getNestedValue(row, accessor) {
  return String(accessor || '').split('.').reduce((value, key) => value?.[key], row)
}

function getLabel(column) {
  return typeof column?.header === 'string' ? column.header : column?.id || ''
}

function toConditions(filters = {}) {
  return Object.entries(filters).map(([columnId, filter]) => ({ columnId, value: filter?.value ?? '' }))
}

export function SavedFiltersDialog({ tableId, columns, rows, filters, onApply }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [profiles, setProfiles] = useLocalStorage(`saved-filter-profiles-${tableId}`, [])
  const [activeId, setActiveId] = useLocalStorage(`active-filter-profile-${tableId}`, '')
  const [name, setName] = useState('')
  const [conditions, setConditions] = useState(() => toConditions(filters))

  const filterableColumns = useMemo(() => columns.filter((column) => column.accessor && column.enableFilter !== false && !column.id.startsWith('__')), [columns])
  const optionsByColumn = useMemo(() => Object.fromEntries(filterableColumns.map((column) => {
    if (column.filterOptions?.length) return [column.id, column.filterOptions]
    const values = new Set()
    rows.forEach((row) => {
      const value = getNestedValue(row, column.accessor)
      if (value !== null && value !== undefined && String(value).trim()) values.add(String(value))
    })
    return [column.id, Array.from(values).sort((a, b) => a.localeCompare(b, i18n.language)).map((value) => ({ value, label: value }))]
  })), [filterableColumns, i18n.language, rows])

  const openDialog = () => {
    setConditions(toConditions(filters))
    setOpen(true)
  }
  const updateCondition = (index, patch) => setConditions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  const buildFilters = () => Object.fromEntries(conditions.filter((item) => item.columnId && String(item.value).trim()).map((item) => [item.columnId, { type: 'select', operator: 'equals', value: item.value }]))
  const applyConditions = () => {
    onApply(buildFilters())
    setActiveId('')
    setOpen(false)
  }
  const saveProfile = () => {
    const trimmedName = name.trim()
    const nextFilters = buildFilters()
    if (!trimmedName || !Object.keys(nextFilters).length) return
    const id = `filter-${Date.now()}`
    setProfiles((current = []) => [...current, { id, name: trimmedName, filters: nextFilters }])
    setName('')
    setActiveId(id)
    onApply(nextFilters)
  }
  const selectProfile = (profile) => {
    setActiveId(profile.id)
    setConditions(toConditions(profile.filters))
    onApply(profile.filters)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={openDialog} className="gap-2" aria-label={t('dataTable.savedFilters.button')}>
        <Filter size={16} />
        <span className="hidden xl:inline">{t('dataTable.savedFilters.button')}</span>
        {activeId && <span className="h-2 w-2 rounded-full bg-[#00A8B0]" />}
      </Button>
      <AppModal isOpen={open} onClose={() => setOpen(false)} title={t('dataTable.savedFilters.title')} size="lg" closeOnBackdrop={false}>
        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-xs font-bold text-[var(--text-muted)]">{t('dataTable.savedFilters.saved')}</h3>
            <div className="flex flex-wrap gap-2">
              {(profiles || []).map((profile) => (
                <div key={profile.id} className="inline-flex items-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface-2)]">
                  <button type="button" onClick={() => selectProfile(profile)} className="px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface)]">{profile.name}</button>
                  <button type="button" onClick={() => { setProfiles((current = []) => current.filter((item) => item.id !== profile.id)); if (activeId === profile.id) setActiveId('') }} className="flex h-9 w-9 items-center justify-center border-s border-[var(--border)] text-[var(--text-muted)] hover:text-red-500" aria-label={t('dataTable.savedFilters.delete')}><Trash2 size={14} /></button>
                </div>
              ))}
              {!profiles?.length && <span className="text-sm text-[var(--text-muted)]">{t('dataTable.savedFilters.none')}</span>}
            </div>
          </section>

          <section className="space-y-3 border-t border-[var(--border)] pt-4">
            {conditions.map((condition, index) => (
              <div key={`${index}-${condition.columnId}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]">
                <select value={condition.columnId} onChange={(event) => updateCondition(index, { columnId: event.target.value, value: '' })} className="h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]">
                  <option value="">{t('dataTable.savedFilters.chooseColumn')}</option>
                  {filterableColumns.map((column) => <option key={column.id} value={column.id}>{getLabel(column)}</option>)}
                </select>
                <select value={condition.value} disabled={!condition.columnId} onChange={(event) => updateCondition(index, { value: event.target.value })} className="h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:opacity-50">
                  <option value="">{t('dataTable.savedFilters.chooseValue')}</option>
                  {(optionsByColumn[condition.columnId] || []).map((option) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}
                </select>
                <button type="button" onClick={() => setConditions((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-red-500" aria-label={t('dataTable.remove')}><X size={16} /></button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setConditions((current) => [...current, { columnId: '', value: '' }])}><Plus size={15} />{t('dataTable.savedFilters.addCondition')}</Button>
          </section>

          <section className="grid gap-2 border-t border-[var(--border)] pt-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('dataTable.savedFilters.namePlaceholder')} />
            <Button variant="outline" onClick={saveProfile} disabled={!name.trim()}><Save size={15} />{t('dataTable.savedFilters.save')}</Button>
            <Button onClick={applyConditions}>{t('dataTable.apply')}</Button>
          </section>
        </div>
      </AppModal>
    </>
  )
}
