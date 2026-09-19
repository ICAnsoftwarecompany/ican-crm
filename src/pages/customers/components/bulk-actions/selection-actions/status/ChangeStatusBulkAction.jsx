import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, RefreshCw } from 'lucide-react'
import { Button } from '../../../../../../shared/components/ui/Button'
import { cn } from '../../../../../../shared/utils/cn'

export function ChangeStatusBulkAction({
  value,
  statuses = [],
  disabled = false,
  selectDisabled = false,
  loading = false,
  onChange,
  onSubmit,
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedStatus = useMemo(
    () => statuses.find((status) => String(status.id) === String(value)) || null,
    [statuses, value]
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={containerRef} className="flex min-w-0 gap-1">
      <div className="relative min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex h-9 w-full items-center justify-between rounded-lg border border-[#D7EEF0] bg-white px-2 text-xs font-bold text-[var(--text)]"
          disabled={selectDisabled || !statuses.length}
          title={selectedStatus?.status || selectedStatus?.name || t('customers.statusChange.chooseStatus')}
        >
          <span className="inline-flex min-w-0 items-center gap-1.5">
            {selectedStatus ? (
              <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#E2E8F0]" style={{ backgroundColor: selectedStatus.color || '#94A3B8' }} />
            ) : null}
            <span className="truncate">
              {selectedStatus ? (selectedStatus.status || selectedStatus.name) : t('customers.statusChange.chooseStatus')}
            </span>
          </span>
          <ChevronDown size={14} className={cn('shrink-0 text-[#64748B] transition-transform', open && 'rotate-180')} />
        </button>

        {open ? (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-[#D7EEF0] bg-white p-1 shadow-xl">
            {statuses.map((status) => {
              const isSelected = String(status.id) === String(value)
              const disabledOption = Boolean(status.disabled)
              const disabledReason = status.disabledReason || ''

              return (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => {
                    if (disabledOption) return
                    onChange?.(String(status.id))
                    setOpen(false)
                  }}
                  disabled={disabledOption}
                  title={disabledOption ? disabledReason : (status.status || status.name || '')}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-start text-xs font-semibold',
                    isSelected ? 'bg-[#E8F9FA] text-[#007A80]' : 'text-[var(--text)] hover:bg-[#F8FAFC]',
                    disabledOption && 'cursor-not-allowed opacity-50 hover:bg-transparent'
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#E2E8F0]" style={{ backgroundColor: status.color || '#94A3B8' }} />
                    <span className="truncate">{status.status || status.name}</span>
                  </span>
                  {isSelected ? <Check size={13} /> : null}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      <Button
        size="icon"
        variant="ai"
        onClick={onSubmit}
        disabled={disabled}
        loading={loading}
        title={t('customers.statusChange.changeSelectedCustomersStatus')}
      >
        <RefreshCw size={15} />
      </Button>
    </div>
  )
}
