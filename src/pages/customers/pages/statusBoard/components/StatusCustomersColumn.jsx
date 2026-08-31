import { useMemo } from 'react'

import { Badge } from '../../../../../shared/components/ui/Badge'
import { DataTable } from '../../../../../shared/components/data-table'

function valueOrDash(value) {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return valueOrDash(value)
  return date.toLocaleString('ar-EG')
}

function getCustomerDisplayName(customer) {
  return customer.name || customer.lead?.name || customer.email || customer.phone || `Customer #${customer.id || '-'}`
}

function buildRows(customers = []) {
  return customers.map((customer, index) => ({
    ...customer,
    _rowIndex: index,
    _displayName: getCustomerDisplayName(customer),
    _displayEmail: customer.email || customer.lead?.email,
    _displayPhone: customer.phone || customer.lead?.phone,
    _displayCompany: customer.company || customer.lead?.company,
    _displayCode: customer.code || customer.lead?.code,
    _displayType: customer.type || customer.lead?.type,
    _displayCreatedAt: formatDateTime(customer.created_at || customer.lead?.created_at),
  }))
}

export function StatusCustomersColumn({ status, customers = [] }) {
  const color = status.color || '#64748B'
  const rows = useMemo(() => buildRows(customers), [customers])

  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'العميل',
      accessor: '_displayName',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-40',
      render: (row) => (
        <span className="font-bold text-[var(--text)]">
          {valueOrDash(row._displayName)}
        </span>
      ),
    },
    {
      id: 'phone',
      header: 'الهاتف',
      accessor: '_displayPhone',
      searchable: true,
      sortable: false,
      visible: true,
      width: 'w-32',
      render: (row) => valueOrDash(row._displayPhone),
    },
    {
      id: 'email',
      header: 'البريد',
      accessor: '_displayEmail',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-40',
      render: (row) => valueOrDash(row._displayEmail),
    },
    {
      id: 'company',
      header: 'الشركة',
      accessor: '_displayCompany',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-32',
      render: (row) => valueOrDash(row._displayCompany),
    },
    {
      id: 'type',
      header: 'النوع',
      accessor: '_displayType',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-24',
      render: (row) => row._displayType ? <Badge>{row._displayType}</Badge> : '-',
    },
    {
      id: 'createdAt',
      header: 'تاريخ الإنشاء',
      accessor: '_displayCreatedAt',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-36',
      render: (row) => valueOrDash(row._displayCreatedAt),
    },
  ], [])

  return (
    <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-[var(--border)] bg-[#F8FEFF] shadow-sm">
      <div className="shrink-0 rounded-t-xl border-b border-[#E5F7F8] bg-white/95 p-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <h2 className="truncate text-sm font-black text-[var(--text)]">{status.status}</h2>
            </div>
            <div className="mt-1 text-xs text-[var(--text-muted)]">العملاء داخل هذه الحالة</div>
          </div>
          <span className="rounded-full bg-[#E8F9FA] px-3 py-1 text-xs font-black text-[#007A80]">
            {customers.length}
          </span>
        </div>
      </div>

      <div className="min-h-0 max-h-[70vh] overflow-y-auto p-3">
        <DataTable
          data={rows}
          columns={columns}
          tableId={`customer-status-board-${status.id}`}
          emptyMessage="لا يوجد عملاء في هذه الحالة."
          enableSorting={true}
          enableFiltering={true}
          enablePagination={false}
          enableColumnVisibility={true}
          enableAdvancedFilters={false}
          enableGlobalSearch={false}
          enableExport={false}
          showToolbar={false}
          showFooter={false}
        />
      </div>
    </section>
  )
}
