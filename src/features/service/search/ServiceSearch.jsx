import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input } from '../../../shared/components/ui/Input'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { cn } from '../../../shared/utils/cn'
import { createServiceApi } from '../core/api/serviceHttp'
import { serviceEndpoints } from '../core/api/endpoints'
import { serviceKeys } from '../core/constants/queryKeys'

const api = createServiceApi('search')

/**
 * One search across the Customer Hub (spec Phase 6 "Global Search"): requests, customers, service records, assets,
 * contracts, help articles. `GET /service/search?q=` → { groups[{ key, items[{ id, title, subtitle, href }] }] }.
 */
export function ServiceSearch() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const boxRef = useRef(null)
  const q = useDebounce(text.trim(), 250)
  const query = useQuery({ queryKey: serviceKeys.search(q), queryFn: async () => (await api.get(serviceEndpoints.search, { params: { q, lang: i18n.language } })).data?.data, enabled: q.length >= 2, placeholderData: (previous) => previous })
  const groups = q.length >= 2 ? query.data?.groups || [] : []
  const flat = groups.flatMap((group) => group.items)
  useEffect(() => setActive(0), [q])
  useEffect(() => {
    const close = (event) => !boxRef.current?.contains(event.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  const go = (item) => {
    if (!item) return
    setOpen(false)
    setText('')
    navigate(item.href)
  }
  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((index) => Math.min(index + 1, flat.length - 1)) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive((index) => Math.max(index - 1, 0)) }
    if (event.key === 'Enter') { event.preventDefault(); go(flat[active]) }
    if (event.key === 'Escape') setOpen(false)
  }
  let index = -1
  return (
    <div ref={boxRef} className="relative w-full sm:max-w-md">
      <Input value={text} onChange={(event) => { setText(event.target.value); setOpen(true) }} onFocus={() => setOpen(true)} onKeyDown={onKeyDown} placeholder={t('service.search.placeholder')} aria-label={t('service.search.placeholder')} startIcon={<Search size={16} aria-hidden="true" />} role="combobox" aria-expanded={open && q.length >= 2} aria-controls="service-search-results" />
      {open && q.length >= 2 && (
        <div id="service-search-results" role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 max-h-96 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
          {query.isLoading && <p className="px-3 py-2 text-sm text-[var(--text-muted)]">{t('service.search.searching')}</p>}
          {!query.isLoading && !groups.length && <p className="px-3 py-2 text-sm text-[var(--text-muted)]">{t('service.search.noResults')}</p>}
          {groups.map((group) => (
            <div key={group.key} className="grid">
              <span className="px-3 pb-1 pt-2 text-xs font-semibold text-[var(--text-muted)]">{t(`service.search.groups.${group.key}`)}</span>
              {group.items.map((item) => {
                index += 1
                const current = index
                return (
                  <button key={`${group.key}-${item.id}`} type="button" role="option" aria-selected={active === current} onMouseEnter={() => setActive(current)} onClick={() => go(item)} className={cn('grid rounded-md px-3 py-1.5 text-start', active === current ? 'bg-[var(--surface-2)]' : '')}>
                    <bdi className="truncate text-sm text-[var(--text)]">{item.title}</bdi>
                    {item.subtitle && <bdi className="truncate text-xs text-[var(--text-muted)]">{item.subtitle}</bdi>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
