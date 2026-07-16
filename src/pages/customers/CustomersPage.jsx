import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { ArchiveRestore, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../shared/components/ui/Button'
import { Badge } from '../../shared/components/ui/Badge'
import { DataTable } from '../../shared/components/data-table'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { NewCustomerDialog } from '../../features/customers/components/NewCustomerDialog'
import { useCustomerMutations, useCustomers, useDeletedCustomers } from '../../features/customers/hooks/useCustomers'

export function CustomersPage() {
  const { t } = useTranslation()
  const [showTrash, setShowTrash] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const customersQuery = useCustomers()
  const deletedQuery = useDeletedCustomers(showTrash)
  const mutations = useCustomerMutations()

  const sourceRows = showTrash ? deletedQuery.data || [] : customersQuery.data || []
  const isLoading = showTrash ? deletedQuery.isLoading : customersQuery.isLoading
  const error = showTrash ? deletedQuery.error : customersQuery.error
  const refetch = () => (showTrash ? deletedQuery.refetch() : customersQuery.refetch())

  const handleDelete = async (customer) => {
    if (!window.confirm(`هل تريد حذف ${customer.name || 'هذا العميل'}؟`)) return

    try {
      await mutations.remove.mutateAsync({ ids: [customer.id] })
    } catch (error) {
      console.error('خطأ في الحذف:', error)
    }
  }

  const handleRestore = async (customer) => {
    try {
      await mutations.restore.mutateAsync({ ids: [customer.id] })
    } catch (error) {
      console.error('خطأ في الاسترجاع:', error)
    }
  }

  const columns = [
    {
      id: 'name',
      header: t('customers.name'),
      accessor: 'name',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-32',
    },
    {
      id: 'email',
      header: t('customers.email'),
      accessor: 'email',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-40',
    },
    {
      id: 'phone',
      header: t('customers.phone'),
      accessor: 'phone',
      searchable: true,
      sortable: false,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-32',
    },
    {
      id: 'company',
      header: 'الشركة',
      accessor: 'company',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-28',
    },
    {
      id: 'type',
      header: 'النوع',
      accessor: 'type',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'عميل', value: 'customer' },
        { label: 'عميل محتمل', value: 'lead' },
      ],
      visible: true,
      width: 'w-24',
      render: (row) => (
        <Badge variant={row.type === 'lead' ? 'warning' : 'success'}>
          {row.type === 'lead' ? 'عميل محتمل' : 'عميل'}
        </Badge>
      ),
    },
    {
      id: 'source',
      header: 'المصدر',
      accessor: 'source',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-24',
    },
    {
      id: 'status',
      header: 'الحالة',
      accessor: 'status.name',
      searchable: false,
      sortable: false,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'جديد', value: 'new' },
        { label: 'معالجة', value: 'processing' },
        { label: 'مكتمل', value: 'completed' },
      ],
      visible: true,
      width: 'w-20',
      render: (row) =>
        row.status?.name && <Badge>{row.status.name}</Badge>,
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      accessor: 'id',
      searchable: false,
      sortable: false,
      filterable: false,
      visible: true,
      width: 'w-28',
      render: (row) =>
        showTrash ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRestore(row)}
            loading={mutations.restore.isPending}
            className="gap-1"
          >
            <ArchiveRestore size={14} />
            استرجاع
          </Button>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row)}
            loading={mutations.remove.isPending}
            className="gap-1"
          >
            <Trash2 size={14} />
            حذف
          </Button>
        ),
    },
  ]

  return (
    <div>
      <PageToolbar title={t('customers.title')} description="إدارة العملاء، البحث، الحذف المؤقت، والاسترجاع.">
        <div className="flex gap-2">
          {!showTrash && (
            <Button variant="primary" onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus size={16} />
              {t('customers.newCustomer')}
            </Button>
          )}
          <Button
            variant={showTrash ? 'primary' : 'outline'}
            onClick={() => setShowTrash((value) => !value)}
            className="gap-2"
          >
            <ArchiveRestore size={16} />
            {showTrash ? t('customers.active') : t('customers.trash')}
          </Button>
        </div>
      </PageToolbar>

      <section>
        <DataTable
          data={sourceRows}
          columns={columns}
          tableId={showTrash ? 'customers-trash' : 'customers'}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyMessage={showTrash ? 'لا توجد عناصر في سلة المحذوفات' : t('customers.noCustomers')}
          enableSorting={true}
          enableFiltering={true}
          enablePagination={true}
          enableColumnVisibility={true}
          showToolbar={true}
          showFooter={true}
        />
      </section>

      <NewCustomerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={mutations.create.mutateAsync}
        isLoading={mutations.create.isPending}
      />
    </div>
  )
}
