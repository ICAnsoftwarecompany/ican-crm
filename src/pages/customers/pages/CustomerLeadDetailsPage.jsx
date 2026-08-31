import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronDown, Loader2, Search, UserRound } from 'lucide-react'

import { definitionsApi } from '../../../features/definitions/api/definitionsApi'
import { useCustomers } from '../../../features/customers/hooks/useCustomers'
import { cn } from '../../../shared/utils/cn'
import { CustomerDetailsContent } from '../components/CustomerDetailsDrawer/CustomerDetailsDrawer'
import { countCustomersByStatus, extractLeadStatuses, getCustomerLeadStatusTypeId } from '../utils/customerStatus'

function getCustomerLabel(customer) {
  return customer?.name || customer?.email || customer?.phone || `عميل #${customer?.id}`
}

function CustomerPageSwitcher({ activeCustomerId }) {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedStatusId, setSelectedStatusId] = useState(null)
  const customersQuery = useCustomers({ per_page: 30 })
  const statusesQuery = useQuery({
    queryKey: ['customers', 'lead-page-switcher', 'statuses'],
    queryFn: () => definitionsApi.getStatuses(),
    staleTime: 1000 * 60,
  })

  const customers = useMemo(() => {
    const pages = customersQuery.data?.pages || []
    return pages.flatMap((page) => (Array.isArray(page?.data) ? page.data : []))
  }, [customersQuery.data])

  const statuses = useMemo(
    () => extractLeadStatuses(statusesQuery.data),
    [statusesQuery.data]
  )

  const countByStatusId = useMemo(
    () => countCustomersByStatus(customers),
    [customers]
  )

  const statusCustomers = useMemo(() => {
    if (selectedStatusId === null || selectedStatusId === undefined || selectedStatusId === '') return []

    return customers.filter((customer) => (
      String(getCustomerLeadStatusTypeId(customer) ?? '') === String(selectedStatusId)
    ))
  }, [customers, selectedStatusId])

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return statusCustomers

    return statusCustomers.filter((customer) => {
      const values = [
        customer?.name,
        customer?.email,
        customer?.phone,
        customer?.company,
        customer?.code,
      ]

      return values.some((value) => String(value || '').toLowerCase().includes(keyword))
    })
  }, [search, statusCustomers])

  const activeCustomer = customers.find((customer) => String(customer.id) === String(activeCustomerId))
  const hasSelectedStatus = selectedStatusId !== null && selectedStatusId !== undefined && selectedStatusId !== ''

  useEffect(() => {
    if (!open) return undefined

    const closeOnOutsidePointerDown = (event) => {
      if (menuRef.current?.contains(event.target)) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointerDown, true)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointerDown, true)
    }
  }, [open])

  const toggleOpen = () => {
    setOpen((value) => {
      const nextOpen = !value
      if (nextOpen) {
        setSelectedStatusId(null)
        setSearch('')
      }
      return nextOpen
    })
  }

  const selectStatus = (statusId) => {
    setSelectedStatusId(statusId)
    setSearch('')
  }

  const selectCustomer = (customer) => {
    setOpen(false)
    setSearch('')
    setSelectedStatusId(null)
    navigate(`/lead/${customer.id}`)
  }

  return (
    <div ref={menuRef} className="relative min-w-0">
      <button
        type="button"
        onClick={toggleOpen}
        className="inline-flex max-w-full items-center gap-2 rounded-xl border border-[#BEEFF2] bg-white px-3 py-2 text-sm font-bold text-[var(--text)] shadow-sm transition-colors hover:bg-[#F8FEFF]"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
          <UserRound size={16} />
        </span>
        <span className="hidden min-w-0 text-start sm:block">
          <span className="block text-[11px] font-semibold text-[var(--text-muted)]">فتح عميل آخر</span>
          <span className="block max-w-48 truncate">
            {activeCustomer ? getCustomerLabel(activeCustomer) : `عميل #${activeCustomerId}`}
          </span>
        </span>
        <ChevronDown size={16} className={cn('shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute end-0 top-12 z-[90] w-[28rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#BEEFF2] bg-white shadow-2xl">
          <div className="border-b border-[#E5F7F8] p-3">
            <div className="mb-2 text-xs font-black text-[var(--text)]">اختر حالة العميل أولًا</div>
            <div className="scrollbar-elegant flex max-h-28 flex-wrap gap-2 overflow-y-auto pe-1">
              {statusesQuery.isLoading && (
                <div className="flex items-center gap-2 rounded-xl bg-[#F8FEFF] px-3 py-2 text-xs font-bold text-[#007A80]">
                  <Loader2 size={14} className="animate-spin" />
                  جاري تحميل الحالات...
                </div>
              )}

              {!statusesQuery.isLoading && statuses.map((status) => {
                const selected = String(selectedStatusId) === String(status.id)

                return (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => selectStatus(status.id)}
                    className={cn(
                      'inline-flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition-colors',
                      selected
                        ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]'
                        : 'border-[#E5F7F8] bg-[#F8FEFF] text-[var(--text)] hover:bg-[#E8F9FA]'
                    )}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: status.color || '#64748B' }}
                    />
                    <span className="max-w-28 truncate">{status.status || status.name}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                      {countByStatusId[String(status.id)] || 0}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {hasSelectedStatus ? (
            <>
              <div className="border-b border-[#E5F7F8] p-2">
                <div className="flex items-center gap-2 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] px-3 py-2">
                  <Search size={15} className="shrink-0 text-[#007A80]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="ابحث داخل عملاء الحالة المختارة"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              <div className="scrollbar-elegant max-h-80 overflow-y-auto p-2">
                {customersQuery.isLoading && (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-[#F8FEFF] px-3 py-4 text-sm font-bold text-[#007A80]">
                    <Loader2 size={16} className="animate-spin" />
                    جاري تحميل العملاء...
                  </div>
                )}

                {!customersQuery.isLoading && filteredCustomers.length === 0 && (
                  <div className="rounded-xl bg-[#F8FEFF] px-3 py-4 text-center text-sm font-semibold text-[var(--text-muted)]">
                    لا يوجد عملاء في هذه الحالة
                  </div>
                )}

                {!customersQuery.isLoading && filteredCustomers.map((customer) => {
                  const selected = String(customer.id) === String(activeCustomerId)

                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => selectCustomer(customer)}
                      className={cn(
                        'flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-start transition-colors',
                        selected ? 'bg-[#E8F9FA] text-[#007A80]' : 'hover:bg-[#F8FEFF]'
                      )}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-black text-[#007A80] ring-1 ring-[#E5F7F8]">
                        {getCustomerLabel(customer).trim().charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-[var(--text)]">{getCustomerLabel(customer)}</span>
                        <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">
                          {customer.phone || customer.email || customer.company || customer.code || `#${customer.id}`}
                        </span>
                      </span>
                      {selected && <Check size={16} className="shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-sm font-semibold text-[var(--text-muted)]">
              اختر حالة من الأعلى لعرض العملاء التابعين لها.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function CustomerLeadDetailsPage() {
  const { customerId } = useParams()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="text-sm text-[var(--text-muted)]" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/customers" className="font-semibold text-[#007A80] hover:underline">
                العملاء
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-[var(--text)]">تفاصيل العميل</li>
          </ol>
        </nav>

        <CustomerPageSwitcher activeCustomerId={customerId} />
      </div>

      <CustomerDetailsContent
        customer={{ id: customerId }}
        enabled={Boolean(customerId)}
        mode="page"
      />
    </div>
  )
}
