import { useState } from 'react'
import { DataTable } from '../../shared/components/data-table'
import { Button } from '../../shared/components/ui/Button'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { Plus } from 'lucide-react'

const SAMPLE_CUSTOMERS = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: `عميل ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  phone: `+966${5 + Math.floor(Math.random() * 5)}${Math.random().toString().slice(2, 11)}`,
  company: `شركة ${Math.floor(i / 5) + 1}`,
  type: i % 2 === 0 ? 'customer' : 'lead',
  status: ['نشط', 'معلق', 'مغلق'][Math.floor(Math.random() * 3)],
  createdAt: new Date(2026, 6, Math.floor(Math.random() * 15) + 1).toLocaleDateString('ar-SA'),
}))

const COLUMNS = [
  {
    id: 'name',
    header: 'الاسم',
    accessor: 'name',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-32',
  },
  {
    id: 'email',
    header: 'البريد الإلكتروني',
    accessor: 'email',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-40',
  },
  {
    id: 'phone',
    header: 'الهاتف',
    accessor: 'phone',
    searchable: true,
    sortable: false,
    visible: true,
    width: 'w-32',
  },
  {
    id: 'company',
    header: 'الشركة',
    accessor: 'company',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-28',
  },
  {
    id: 'type',
    header: 'النوع',
    accessor: 'type',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-20',
    render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.type === 'customer' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {row.type === 'customer' ? 'عميل' : 'عميل محتمل'}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'الحالة',
    accessor: 'status',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-20',
    render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.status === 'نشط' ? 'bg-blue-100 text-blue-700' :
        row.status === 'معلق' ? 'bg-yellow-100 text-yellow-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {row.status}
      </span>
    ),
  },
  {
    id: 'createdAt',
    header: 'تاريخ الإنشاء',
    accessor: 'createdAt',
    searchable: false,
    sortable: true,
    visible: true,
    width: 'w-24',
  },
]

export function DataTableDemo() {
  const [data] = useState(SAMPLE_CUSTOMERS)
  const [isLoading] = useState(false)

  return (
    <div>
      <PageToolbar title="عرض توضيحي - جدول البيانات" description="اختبر مكون DataTable مع الفرز والبحث والتصفيح والأعمدة">
        <Button variant="primary" className="gap-2">
          <Plus size={16} />
          إضافة عميل
        </Button>
      </PageToolbar>

      <section>
        <DataTable
          data={data}
          columns={COLUMNS}
          tableId="customers-demo"
          isLoading={isLoading}
          emptyMessage="لا توجد عملاء"
          enableSorting={true}
          enableFiltering={true}
          enablePagination={true}
          enableColumnVisibility={true}
          showToolbar={true}
          showFooter={true}
        />
      </section>
    </div>
  )
}
